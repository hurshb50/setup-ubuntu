import { defineConfig } from "vite-plus";

const configuration = defineConfig({
    fmt: {
        printWidth: 120,
        tabWidth: 4,
        sortPackageJson: false,
    },
    lint: {
        categories: { correctness: "error" },
        options: {
            typeAware: true,
            typeCheck: true,
        },
    },
    pack: {
        entry: "./source/setup-ubuntu.ts",
        deps: { alwaysBundle: "@commander-js/extra-typings" },
        outDir: "distribution",
        copy: [],
    },
    test: { passWithNoTests: true },
});

export default configuration;
