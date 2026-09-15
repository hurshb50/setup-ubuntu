#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { name, version } from "../package.json";

program.name(name).version(version).description("TODO");
program.parse();
