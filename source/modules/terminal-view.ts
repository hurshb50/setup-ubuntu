import { execAsync } from "./exec-async";

export async function installTerminalView(): Promise<void> {
    console.log("Installing terminal view");
    await execAsync("sudo apt-get install -y --no-install-recommends unzip");
    await execAsync("curl -s https://ohmyposh.dev/install.sh | bash -s");
    console.log("Installed terminal view");
}
