import type { Logger } from "./logger";

export interface Package {
    systemDependencyNames?: string[];
    systemName?: string;
    setupSystemSources?: () => Promise<void>;
    postSystemInstall: (logger: Logger) => Promise<void>;
}
