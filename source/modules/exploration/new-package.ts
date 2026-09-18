import type { PackageManager } from "./package-manager";
import type { Logger } from "./logger";

export interface Package {
    install: (context: InstallContext) => Promise<void>;
}

export interface InstallContext {
    directories: Directories;
    logger: Logger;
    packageManager: PackageManager;
}

interface Directories {
    assets: string;
    current: string;
    home: string;
}
