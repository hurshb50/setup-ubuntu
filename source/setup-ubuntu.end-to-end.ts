import fs from "fs/promises";
import os from "os";
import path from "path";
import { execa } from "execa";
import { expect, test } from "vite-plus/test";

const projectDirectoryPath = path.join(import.meta.dirname, "..");

test("installs every package on a fresh machine", { timeout: 600_000 }, async () => {
    const { exitCode } = await execa("setup-ubuntu", [], { reject: false });
    expect(exitCode).toBe(0);
    const destinationFilePath = path.join(os.homedir(), ".bashrc");
    const sourceFilePath = path.join(projectDirectoryPath, "assets", ".bashrc");
    expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
});
