import type { DependencyManager } from "../dependency-manager/dependency-manager";
import type { Logger } from "../logger/logger";

export interface Package {
    isInstalled: (context: InstallContext) => Promise<boolean>;
    install: (context: InstallContext) => Promise<void>;
    uninstall?: (context: InstallContext) => Promise<void>;
}

export type RemovablePackage = Package & Required<Pick<Package, "uninstall">>;

// Previously supported tools that are removed automatically on every run.
export type LegacyPackage = Omit<RemovablePackage, "install">;

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

export function isRemovable(implementation: Package): implementation is RemovablePackage {
    return implementation.uninstall !== undefined;
}
