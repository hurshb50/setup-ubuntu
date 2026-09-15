import path from "path";
import os from "os";
import fs from "fs/promises";
import { execAsync } from "./exec-async";

export async function installAutoSuggestion(): Promise<void> {
    console.log("installing auto suggestion");
    await execAsync(`sudo apt-get install -y --no-install-recommends xz-utils`);

    const systemTemporaryDirectoryPath = os.tmpdir();
    const temporaryDirectoryPathPrefix = path.join(systemTemporaryDirectoryPath, "ble.sh");
    const temporaryDirectoryPath = await fs.mkdtemp(temporaryDirectoryPathPrefix);

    await execAsync(
        `curl -L https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly.tar.xz | tar xJf - -C ${temporaryDirectoryPath}`,
    );

    const localShareDirectoryPath = path.join(os.homedir(), ".local", "share");
    const bleshFilePath = path.join(temporaryDirectoryPath, "ble-nightly", "ble.sh");
    await execAsync(`bash ${bleshFilePath} --install ${localShareDirectoryPath}`);
    await fs.rm(temporaryDirectoryPath, { recursive: true });
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const blercFilePath = path.join(assetsDirectoryPath, ".blerc");
    const homeDirectoryPath = os.homedir();
    const homeBlercFilePath = path.join(homeDirectoryPath, ".blerc");
    await fs.copyFile(blercFilePath, homeBlercFilePath);
    console.log("installed auto suggestion");
}
