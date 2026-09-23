import { execa } from "execa";
import { existsSync } from "fs";

export async function setup(): Promise<void> {
    const isInContainer = existsSync("/.dockerenv");

    if (!isInContainer) throw new Error("Not in a docker container.");

    await execa("vp", ["install", "-g", "./package.tgz"]);
}
