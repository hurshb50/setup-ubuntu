import fs from "fs/promises";

export async function pathExists(filePath: string): Promise<boolean> {
    const statistics = await fs.stat(filePath, { throwIfNoEntry: false });
    return statistics !== undefined;
}
