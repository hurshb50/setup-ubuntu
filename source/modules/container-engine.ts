import os from "os";
import { execAsync } from "./exec-async";

export async function installContainerEngine(): Promise<void> {
    console.log("installing container engine");
    await execAsync("sudo apt-get install --yes --no-install-recommends gnupg");

    await execAsync(
        "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/docker.gpg",
    );

    await execAsync(
        'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
    );

    await execAsync("sudo apt-get update");

    await execAsync(
        "sudo apt-get install --yes --no-install-recommends docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
    );

    await execAsync(`sudo usermod --append --groups docker ${os.userInfo().username}`);
    console.log("installed container engine");
}
