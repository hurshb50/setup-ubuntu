import { execAsync } from "./exec-async";

export async function updateSystemPackageManager(): Promise<void> {
    console.log("updating system package manager");
    await execAsync("sudo apt-get update");
    console.log("updated system package manager");
}
