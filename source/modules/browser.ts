import { execAsync } from "./exec-async";

export async function installBrowser(): Promise<void> {
    console.log("installing browser");
    await execAsync("sudo apt-get install --yes --no-install-recommends gnupg");

    await execAsync(
        "curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor --yes -o /usr/share/keyrings/google-chrome.gpg",
    );

    await execAsync(
        "echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list > /dev/null",
    );

    await execAsync("sudo apt-get update");
    await execAsync("sudo apt-get install --yes --no-install-recommends google-chrome-stable");
    console.log("installed browser");
}
