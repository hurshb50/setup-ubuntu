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
        outDir: "distribution",
        copy: ["assets"],
    },
    test: {
        passWithNoTests: true,
        projects: [
            {
                test: {
                    name: "unit",
                    include: ["./source/**/unit/**.test.ts"],
                },
            },
            {
                test: {
                    name: "integration",
                    include: ["./source/**/integration/**.test.ts"],
                    globalSetup: ["./source/modules/test/integration/global-setup.ts"],
                },
            },
            {
                test: {
                    name: "end-to-end",
                    include: ["./source/**/end-to-end/**.test.ts"],
                    globalSetup: ["./source/modules/test/end-to-end/global-setup.ts"],
                },
            },
        ],
    },
});

export default configuration;
