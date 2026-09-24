import util from "util";
import childProcess from "child_process";
import { existsSync } from "fs";

export async function setup(): Promise<void> {
    const isInContainer = existsSync("/.dockerenv");

    if (!isInContainer) throw new Error("Not in a docker container.");

    const exec = util.promisify(childProcess.exec);
    await exec("vp install -g ./package.tgz");
}
