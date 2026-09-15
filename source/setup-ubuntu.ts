#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";
import { installGit } from "./git";

program
    .name(name)
    .version(version)
    .description("TODO")
    .action(() => {
        installGit();
    });

program.parse();
