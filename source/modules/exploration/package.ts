import type { TaskLogger } from "./task-logger";

export interface Package {
    systemDependencyNames?: string[];
    systemName?: string;
    setupSystemSources?: () => Promise<void>;
    postSystemInstall: (logger: TaskLogger) => Promise<void>;
}
