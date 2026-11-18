import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const latestReleaseUrl = "https://github.com/ajeetdsouza/zoxide/releases/latest";

// Mirrors the targets chosen by the upstream install.sh.
const targets: Partial<Record<string, string>> = {
    x64: "x86_64-unknown-linux-musl",
    arm64: "aarch64-unknown-linux-musl",
};

// The upstream install.sh queries the GitHub API, which rate limits shared IPs such as CI runners.
// Following the release redirect and downloading the asset directly avoids the API.
export function zoxideDownloadUrl(releaseUrl: string, architecture: string): string {
    const version = releaseUrl.trim().match(/\/tag\/v([^/]+)$/)?.[1];
    if (version === undefined) throw new Error(`Cannot find the zoxide version in '${releaseUrl}'.`);

    const target = targets[architecture];
    if (target === undefined) throw new Error(`zoxide is not available for architecture '${architecture}'.`);

    return `https://github.com/ajeetdsouza/zoxide/releases/download/v${version}/zoxide-${version}-${target}.tar.gz`;
}

export class SmartChangeDirectory implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        const binaryFilePath = path.join(context.directories.home, ".local", "bin", "zoxide");
        const statistics = await fs.stat(binaryFilePath, { throwIfNoEntry: false });
        return statistics !== undefined;
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Smart Change Directory");
        context.logger.add(task);
        task.start();

        const binaryDirectoryPath = path.join(context.directories.home, ".local", "bin");
        const manualDirectoryPath = path.join(context.directories.home, ".local", "share", "man", "man1");
        const isInstalled = await this.isInstalled(context);

        if (isInstalled) {
            task.finish();
            return;
        }

        task.continue("Find latest zoxide release");
        const exec = util.promisify(childProcess.exec);
        const { stdout: releaseUrl } = await exec(`curl -sSfLI -o /dev/null -w '%{url_effective}' ${latestReleaseUrl}`);
        const downloadUrl = zoxideDownloadUrl(releaseUrl, os.arch());
        const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "zoxide-"));

        try {
            task.continue("Download zoxide");
            await exec(`curl -sSfL ${downloadUrl} | tar xzf - -C ${temporaryDirectoryPath}`);

            task.continue("Install zoxide");
            const binaryFilePath = path.join(binaryDirectoryPath, "zoxide");
            await fs.mkdir(binaryDirectoryPath, { recursive: true });
            await fs.copyFile(path.join(temporaryDirectoryPath, "zoxide"), binaryFilePath);
            await fs.chmod(binaryFilePath, 0o755);

            task.continue("Install manual pages");
            await fs.mkdir(manualDirectoryPath, { recursive: true });
            await fs.cp(path.join(temporaryDirectoryPath, "man", "man1"), manualDirectoryPath, { recursive: true });
        } finally {
            await fs.rm(temporaryDirectoryPath, { recursive: true, force: true });
        }

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Smart Change Directory");
        context.logger.add(task);
        task.start();

        const home = context.directories.home;

        task.continue("Remove zoxide");
        await fs.rm(path.join(home, ".local", "bin", "zoxide"), { force: true });

        task.continue("Remove manual pages");
        const manualDirectoryPath = path.join(home, ".local", "share", "man", "man1");
        const manualFileNames = await fs.readdir(manualDirectoryPath).catch(() => []);

        await Promise.all(
            manualFileNames
                .filter((fileName) => fileName.startsWith("zoxide"))
                .map((fileName) => fs.rm(path.join(manualDirectoryPath, fileName), { force: true })),
        );

        task.continue("Remove user data");
        await fs.rm(path.join(home, ".local", "share", "zoxide"), { recursive: true, force: true });

        task.finish();
    }
}
