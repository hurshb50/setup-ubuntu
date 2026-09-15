import childProcess from "child_process";

export function installGit(): void {
    childProcess.execSync("apt-get install -y --no-install-recommends git ", { stdio: "inherit" });
}
