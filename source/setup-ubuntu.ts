#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import { installGit } from "./git";
import { updateApt } from "./apt";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(() => {
        updateApt();
        installGit();
    });

program.parse();
