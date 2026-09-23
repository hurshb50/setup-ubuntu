import fs from "fs";
import path from "path";

export const projectDirectoryPath = findProjectDirectoryPath(process.cwd());

export const assetsDirectoryPath = path.join(projectDirectoryPath, "assets");

function findProjectDirectoryPath(startDirectoryPath: string): string {
    let directoryPath = path.resolve(startDirectoryPath);

    while (true) {
        if (fs.existsSync(path.join(directoryPath, "package.json"))) return directoryPath;

        const parentDirectoryPath = path.dirname(directoryPath);

        if (parentDirectoryPath === directoryPath) {
            throw new Error(`Cannot find project directory containing 'package.json' from '${startDirectoryPath}'.`);
        }

        directoryPath = parentDirectoryPath;
    }
}
