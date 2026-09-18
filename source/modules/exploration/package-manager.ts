import { execa } from "execa";

export class PackageManager {
    async install(packages: string[]): Promise<void> {
        await execa("sudo", ["apt-get", "-o", "DPkg::Lock::Timeout=300", "install", ...packages]);
    }

    async update(): Promise<void> {
        await execa("sudo", ["apt-get", "-o", "DPkg::Lock::Timeout=300", "update"]);
    }
}
