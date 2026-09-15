import path from "path";
import fs from "fs/promises";
import os from "os";
import { existsSync } from "fs";

export async function installFonts(): Promise<void> {
    console.log("installing fonts");
    const fontsDirectoryPath = path.join(import.meta.dirname, "assets", "fonts");
    const systemFontsDirectoryPath = path.join(os.homedir(), ".local", "share", "fonts");
    const systemFontsDirectoryPathDoesNotExist = existsSync(systemFontsDirectoryPath) === false;

    if (systemFontsDirectoryPathDoesNotExist) await fs.mkdir(systemFontsDirectoryPath);

    await fs.cp(fontsDirectoryPath, systemFontsDirectoryPath, { recursive: true });
    console.log(await fs.readdir(systemFontsDirectoryPath, { recursive: true, withFileTypes: true }));
    console.log("installed fonts");
}
