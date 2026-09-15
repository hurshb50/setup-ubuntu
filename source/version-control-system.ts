import { execAsync } from "./exec-async";

export async function installVersionControlSystem(): Promise<void> {
    console.log("installing version control system");
    await execAsync("sudo apt-get install -y --no-install-recommends git build-essential");
    console.log("installed version control system");
}
