import { existsSync } from "fs";

const isInContainer = existsSync("/.dockerenv");

if (!isInContainer) throw new Error("Not in a docker container.");
