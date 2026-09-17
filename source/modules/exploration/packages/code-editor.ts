import path from "path";
import { execAsync } from "./exec-async";
import fs from "fs/promises";
import os from "os";

export async function installCodeEditor(): Promise<void> {
    console.log("installing code editor");
    await execAsync("curl -f https://zed.dev/install.sh | sh");
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const zedDirectoryPath = path.join(assetsDirectoryPath, "zed");
    const homeDirectoryPath = os.homedir();
    const configurationDirectoryPath = path.join(homeDirectoryPath, ".config");
    const configurationZedDirectoryPath = path.join(configurationDirectoryPath, "zed");
    await fs.cp(zedDirectoryPath, configurationZedDirectoryPath, { recursive: true });
    console.log("installed code editor");
}
