import path from "path";
import { execAsync } from "./exec-async";
import fs from "fs/promises";
import os from "os";

export async function installCodeEditor(): Promise<void> {
    console.log("installing code editor");

    // await execAsync(
    //     "sudo apt-get install -y --no-install-recommends libgio-2.0.so.0 libgobject-2.0.so.0 libglib-2.0.so.0 libasound.so.2",
    // );

    await execAsync("curl -f https://zed.dev/install.sh | sh");
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const zedDirectoryPath = path.join(assetsDirectoryPath, "zed");
    const homeDirectoryPath = os.homedir();
    const configurationDirectoryPath = path.join(homeDirectoryPath, ".config");
    const configurationZedDirectoryPath = path.join(configurationDirectoryPath, "zed");
    await fs.cp(zedDirectoryPath, configurationZedDirectoryPath, { recursive: true });
    console.log(await fs.readdir(configurationZedDirectoryPath));
    console.log("installed code editor");
}
