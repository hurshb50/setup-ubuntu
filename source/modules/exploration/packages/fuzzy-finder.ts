import { execAsync } from "./exec-async";

export async function installFuzzyFinder(): Promise<void> {
    console.log("installing fuzzy finder");
    await execAsync("sudo apt-get install -y --no-install-recommends fzf");
    console.log("installed fuzzy finder");
}
