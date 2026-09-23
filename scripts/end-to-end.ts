import childProcess from "child_process";
import path from "path";

async function main(): Promise<void> {
    const imageName = "setup-ubuntu:end-to-end";
    const projectDirectoryPath = process.cwd();
    const dockerfilePath = path.join(projectDirectoryPath, "docker", "end-to-end.dockerfile");

    childProcess.execSync(`docker build --tag ${imageName} --file ${dockerfilePath} .`, {
        cwd: projectDirectoryPath,
        stdio: "inherit",
    });

    childProcess.execSync(`docker run --rm ${imageName} vp test --project end-to-end`, {
        cwd: projectDirectoryPath,
        stdio: "inherit",
    });
}

await main();
