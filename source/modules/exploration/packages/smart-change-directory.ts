import { execAsync } from "./exec-async";

export async function installSmartChangeDirectory(): Promise<void> {
    console.log("installing smart change directory");
    await execAsync("curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh");
    console.log("installed smart change directory");
}
