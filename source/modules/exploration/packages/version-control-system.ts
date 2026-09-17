import type { Package } from "../package";

export class VersionControlSystem implements Package {
    systemDependencyNames = ["build-essential"];
    systemName = "git";
}
