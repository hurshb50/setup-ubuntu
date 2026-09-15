import childProcess from "child_process";

export function updateApt(): void {
    childProcess.execSync("apt-get update", { stdio: "inherit" });
}
