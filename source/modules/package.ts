import type { DependencyManager } from "../dependency-managerency-manager";
import type { Logger } from "../loggeration/loggerr";

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
