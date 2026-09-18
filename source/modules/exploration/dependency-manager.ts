import { execa } from "execa";

export class DependencyManager {
    async install(dependencies: string[]): Promise<void> {
        await execa("sudo", ["apt-get", "-o", "DPkg::Lock::Timeout=500", "install", ...dependencies]);
    }

    async update(): Promise<void> {
        await execa("sudo", ["apt-get", "-o", "DPkg::Lock::Timeout=500", "update"]);
    }
}
