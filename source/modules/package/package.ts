import type { DependencyManager } from "../dependency-manager/dependency-manager";
import type { Logger } from "../logger/logger";

export interface Package {
    install: (context: InstallContext) => Promise<void>;
}

export interface InstallContext {
    dependencyManager: DependencyManager;
    directories: Directories;
    logger: Logger;
}

interface Directories {
    assets: string;
    current: string;
    home: string;
}
