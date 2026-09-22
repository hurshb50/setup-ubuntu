import { existsSync } from "fs";

export function setup(): void {
    const isInContainer = existsSync("/.dockerenv");

    if (!isInContainer) throw new Error("Not in a docker container.");
}
