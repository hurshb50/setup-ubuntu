#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import { installVersionControlSystem } from "./version-control-system";
import { updateSystemPackageManager } from "./system-package-manager";
import { installTerminalView } from "./terminal-view";
import { installFonts } from "./fonts";
import { installFuzzyFinder } from "./fuzzy-finder";
import { installAutoSuggestion } from "./auto-suggestion";
import { installSmartChangeDirectory } from "./smart-change-directory";
import { installCodeEditor } from "./code-editor";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(async () => {
        // await updateSystemPackageManager();
        await installCodeEditor();
        // await installSmartChangeDirectory();
        // await installAutoSuggestion();
        // await installFuzzyFinder();
        // await installFonts();
        // await installVersionControlSystem();
        // await installTerminalView();
    });

program.parse();
