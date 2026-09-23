import childProcess from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import z from "zod";

async function main(): Promise<void> {
    const imageName = "setup-ubuntu:integration";
    const projectDirectoryPath = process.cwd();
    const dockerfilePath = path.join(projectDirectoryPath, "docker", "integration.dockerfile");
    const testFilePaths = fs.globSync("**/*.integration.ts");

    childProcess.execSync(`docker build --tag ${imageName} --file ${dockerfilePath} .`, {
        cwd: projectDirectoryPath,
        stdio: "inherit",
    });

    const exec = util.promisify(childProcess.exec);
    const execErrorValidator = z.object({ stderr: z.string() });
    let failed = false;

    const testCalls = testFilePaths.map(async (filePath) => {
        const command = `docker run --rm ${imageName} vp test --project integration ${filePath}`;
        let message: string | undefined;

        try {
            const { stdout } = await exec(command, { cwd: projectDirectoryPath });
            message = stdout;
        } catch (error) {
            if (execErrorValidator.validate(error)) message = error.stderr;
            else message = String(error);

            failed = true;
        } finally {
            if (message) process.stdout.write(message);
        }
    });

    await Promise.all(testCalls);
    process.exit(failed ? 1 : 0);
}

await main();
