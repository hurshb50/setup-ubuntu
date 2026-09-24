import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { expect, test } from "vite-plus/test";

const projectDirectoryPath = path.join(import.meta.dirname, "..");

test("installs every package on a fresh machine", { timeout: 600_000 }, async () => {
    const exec = util.promisify(childProcess.exec);
    await exec("setup-ubuntu");
    const destinationFilePath = path.join(os.homedir(), ".bashrc");
    const sourceFilePath = path.join(projectDirectoryPath, "assets", ".bashrc");
    expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
});
