import fs from "fs/promises";
import os from "os";
import path from "path";

export async function installShellConfiguration(): Promise<void> {
    console.log("installing shell configuration");
    const homeDirectoryPath = os.homedir();
    const homeShellConfigurationFilePath = path.join(homeDirectoryPath, ".bashrc");
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const sourceShellConfigurationPath = path.join(assetsDirectoryPath, ".bashrc");
    await fs.copyFile(sourceShellConfigurationPath, homeShellConfigurationFilePath);
    console.log("installed shell configuration");
}
