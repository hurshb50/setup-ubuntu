import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { execa } from "execa";

const imageName = "setup-ubuntu:integration";
const projectDirectoryPath = path.join(import.meta.dirname, "..");
const assetsDirectoryPath = path.join(projectDirectoryPath, "assets");
const sourceDirectoryPath = path.join(projectDirectoryPath, "source");
const dockerfilePath = path.join(projectDirectoryPath, "docker", "integration.dockerfile");
const durationsFilePath = path.join(projectDirectoryPath, "node_modules", ".cache", "integration-durations.json");

interface Result {
    durationSeconds: number;
    exitCode: number | undefined;
    filePath: string;
    output: string;
}

async function main(): Promise<void> {
    const concurrency = getConcurrency();
    const filePaths = await findIntegrationFilePaths();

    if (filePaths.length === 0) throw new Error("Cannot find any integration test files.");

    const durations = await readDurations();
    const buildStartedAt = performance.now();
    const isBuilt = await buildImage();
    const buildDurationSeconds = (performance.now() - buildStartedAt) / 1000;

    console.log(isBuilt ? `Built the image in ${buildDurationSeconds.toFixed(1)}s.` : "The image is up to date.");

    const startedAt = performance.now();
    const results = await runIntegrationTests(filePaths, durations, concurrency);
    const durationSeconds = (performance.now() - startedAt) / 1000;
    const failures = results.filter(({ exitCode }) => exitCode !== 0);
    const passed = results.length - failures.length;

    for (const result of results) {
        if (result.exitCode === 0) durations[result.filePath] = result.durationSeconds;
    }

    await writeDurations(durations);

    for (const failure of failures) {
        console.error(`✗ ${failure.filePath}`);
        console.error(failure.output);
    }

    if (results.length < filePaths.length) console.log("Stopped after the first failure.");

    const summary = `${passed}/${filePaths.length} files passed in ${durationSeconds.toFixed(1)}s at concurrency ${concurrency}.`;

    console.log("");
    console.log(summary);

    if (failures.length > 0) process.exitCode = 1;
}

async function buildImage(): Promise<boolean> {
    const inputsHash = await hashInputs();

    if (await isImageCurrent(inputsHash)) return false;

    await execa(
        "docker",
        ["build", "--tag", imageName, "--label", `setup-ubuntu.inputs=${inputsHash}`, "--file", dockerfilePath, "."],
        { cwd: projectDirectoryPath, stdio: "inherit" },
    );

    return true;
}

async function isImageCurrent(inputsHash: string): Promise<boolean> {
    const format = '{{ index .Config.Labels "setup-ubuntu.inputs" }}';
    const { stdout } = await execa("docker", ["image", "inspect", "--format", format, imageName], { reject: false });

    return stdout.trim() === inputsHash;
}

async function hashInputs(): Promise<string> {
    const filePaths = [
        dockerfilePath,
        path.join(projectDirectoryPath, "package.json"),
        path.join(projectDirectoryPath, "package-lock.json"),
        ...(await findFiles(assetsDirectoryPath)),
        ...(await findFiles(sourceDirectoryPath)),
    ].sort();

    const hash = crypto.createHash("sha256");

    for (const filePath of filePaths) hash.update(await fs.readFile(filePath));

    return hash.digest("hex");
}

async function runIntegrationTests(
    filePaths: string[],
    durations: Record<string, number>,
    concurrency: number,
): Promise<Result[]> {
    const queue = [...filePaths].sort(
        (first, second) => getDuration(durations, second) - getDuration(durations, first),
    );
    const results: Result[] = [];
    let hasFailure = false;

    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
        let filePath = queue.shift();

        while (filePath !== undefined && !hasFailure) {
            const result = await runIntegrationTest(filePath);

            if (result.exitCode !== 0) hasFailure = true;

            results.push(result);
            filePath = queue.shift();
        }
    });

    await Promise.all(workers);

    return results.sort((first, second) => first.filePath.localeCompare(second.filePath));
}

async function runIntegrationTest(filePath: string): Promise<Result> {
    const startedAt = performance.now();

    const { exitCode, stdout, stderr } = await execa(
        "docker",
        ["run", "--rm", imageName, "vp", "test", "--project", "integration", filePath],
        { cwd: projectDirectoryPath, reject: false },
    );

    const durationSeconds = (performance.now() - startedAt) / 1000;

    console.log(`${exitCode === 0 ? "✓" : "✗"} ${filePath} (${durationSeconds.toFixed(1)}s)`);

    return {
        durationSeconds,
        exitCode,
        filePath,
        output: [stdout, stderr].filter((text) => text !== "").join("\n"),
    };
}

function getDuration(durations: Record<string, number>, filePath: string): number {
    return durations[filePath] ?? Number.POSITIVE_INFINITY;
}

function getConcurrency(): number {
    const value = process.env.INTEGRATION_CONCURRENCY;

    if (value === undefined) return os.availableParallelism();

    const concurrency = Number(value);

    if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error(`Invalid concurrency '${value}'.`);

    return concurrency;
}

async function readDurations(): Promise<Record<string, number>> {
    const contents = await fs.readFile(durationsFilePath, "utf8").catch(() => "");

    if (contents === "") return {};

    return JSON.parse(contents) as Record<string, number>;
}

async function writeDurations(durations: Record<string, number>): Promise<void> {
    await fs.mkdir(path.dirname(durationsFilePath), { recursive: true });
    await fs.writeFile(durationsFilePath, `${JSON.stringify(durations, undefined, 4)}\n`);
}

async function findIntegrationFilePaths(): Promise<string[]> {
    const filePaths = await findFiles(sourceDirectoryPath);

    return filePaths
        .filter((filePath) => filePath.endsWith(".integration.ts"))
        .map((filePath) => path.relative(projectDirectoryPath, filePath))
        .sort();
}

async function findFiles(directoryPath: string): Promise<string[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    const filePaths = await Promise.all(
        entries.map((entry) => {
            const entryPath = path.join(directoryPath, entry.name);

            return entry.isDirectory() ? findFiles(entryPath) : Promise.resolve([entryPath]);
        }),
    );

    return filePaths.flat();
}

await main();
