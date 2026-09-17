import fs from "fs/promises";
import os from "os";
import path from "path";

export async function installAgentSkills(): Promise<void> {
    console.log("installing agent skills");
    const homeDirectoryPath = os.homedir();
    const globalSkillsDirectoryPath = path.join(homeDirectoryPath, ".agents", "skills");
    const assetsDirectoryPath = path.join(import.meta.dirname, "assets");
    const skillsDirectoryPath = path.join(assetsDirectoryPath, "skills");
    await fs.mkdir(globalSkillsDirectoryPath, { recursive: true });
    await fs.cp(skillsDirectoryPath, globalSkillsDirectoryPath, { recursive: true });
    console.log("installed agent skills");
}
