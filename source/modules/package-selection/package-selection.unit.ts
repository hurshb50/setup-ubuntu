import { describe, expect, test } from "vite-plus/test";
import type { InstallContext, Package } from "../package/package";
import {
    getAvailableActions,
    getNextAction,
    getSelection,
    selectPackages,
    toggleAllActions,
    type PackageOption,
} from "./package-selection";

const createPackage = (): Package => ({ isInstalled: async () => true, install: async () => {} });
const createRemovablePackage = (): Package => ({ ...createPackage(), uninstall: async () => {} });

const packageA = createPackage();
const packageB = createRemovablePackage();
const packageC = createRemovablePackage();

const options: PackageOption[] = [
    { label: "Package A", implementation: packageA },
    { label: "Package B", implementation: packageB },
    { label: "Package C", implementation: packageC },
];

const context = {} as InstallContext;

describe("package selection", () => {
    test("installs every package when no interactive terminal is available", async () => {
        await expect(selectPackages(options, context, false)).resolves.toEqual({
            install: [packageA, packageB, packageC],
            uninstall: [],
        });
    });

    test("splits packages into installs and removals in their original order", () => {
        expect(getSelection(options, ["install", "uninstall", "install"])).toEqual({
            install: [packageA, packageC],
            uninstall: [packageB],
        });
    });

    test("returns nothing when every package is skipped", () => {
        expect(getSelection(options, ["skip", "skip", "skip"])).toEqual({ install: [], uninstall: [] });
    });

    test("never removes a package that cannot be uninstalled", () => {
        expect(getSelection(options, ["uninstall", "skip", "skip"])).toEqual({ install: [], uninstall: [] });
    });
});

describe("available actions", () => {
    test("offers removal for an installed package that can be uninstalled", () => {
        expect(getAvailableActions(packageB, true)).toEqual(["install", "uninstall", "skip"]);
    });

    test("hides removal when the package is not installed", () => {
        expect(getAvailableActions(packageB, false)).toEqual(["install", "skip"]);
    });

    test("hides removal when the package cannot be uninstalled", () => {
        expect(getAvailableActions(packageA, true)).toEqual(["install", "skip"]);
    });
});

describe("next action", () => {
    test("cycles through install, remove, and skip", () => {
        const actions = getAvailableActions(packageB, true);

        expect(getNextAction("install", actions)).toBe("uninstall");
        expect(getNextAction("uninstall", actions)).toBe("skip");
        expect(getNextAction("skip", actions)).toBe("install");
    });

    test("toggles between install and skip when removal is unavailable", () => {
        const actions = getAvailableActions(packageA, true);

        expect(getNextAction("install", actions)).toBe("skip");
        expect(getNextAction("skip", actions)).toBe("install");
    });
});

describe("toggle all", () => {
    test("skips everything when every package is set to install", () => {
        expect(toggleAllActions(["install", "install"])).toEqual(["skip", "skip"]);
    });

    test("installs everything when any package is not set to install", () => {
        expect(toggleAllActions(["install", "uninstall", "skip"])).toEqual(["install", "install", "install"]);
    });
});
