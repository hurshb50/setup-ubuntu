export interface Package {
    systemDependencyNames?: string[];
    systemName?: string;
    setupSystemSources?: () => void;
    postSystemInstall?: () => void;
}
