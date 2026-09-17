import { execAsync } from "./exec-async";
import fs from "fs/promises";
import os from "os";
import path from "path";

export async function installWallpapers(): Promise<void> {
    console.log("installing wallpapers");
    await execAsync("sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends hydrapaper");
    const homeDirectoryPath = os.homedir();
    const backgroundsDirectoryPath = path.join(homeDirectoryPath, ".local", "share", "backgrounds");
    await fs.mkdir(backgroundsDirectoryPath, { recursive: true });
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const wallpapersDirectoryPath = path.join(assetsDirectoryPath, "wallpapers");
    await fs.cp(wallpapersDirectoryPath, backgroundsDirectoryPath, { recursive: true });
    console.log("installed wallpapers");
}
