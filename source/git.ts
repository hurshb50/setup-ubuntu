import childProcess from "child_process";

export function installGit(): void {
    childProcess.execSync("sudo apt-get install git-all", { stdio: "inherit", shell: "bash" });
}
