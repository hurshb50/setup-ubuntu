import { describe, expect, test } from "vite-plus/test";
import type { Package } from "../package/package";
import { getSelectedPackages, selectPackages, type PackageOption } from "./package-selection";

const packageA: Package = { install: async () => {} };
const packageB: Package = { install: async () => {} };
const packageC: Package = { install: async () => {} };

const options: PackageOption[] = [
    { label: "Package A", implementation: packageA },
    { label: "Package B", implementation: packageB },
    { label: "Package C", implementation: packageC },
];

describe("package selection", () => {
    test("selects every package when no interactive terminal is available", async () => {
        await expect(selectPackages(options, false)).resolves.toEqual([packageA, packageB, packageC]);
    });

    test("returns selected packages in their original order", () => {
        expect(getSelectedPackages(options, new Set([2, 0]))).toEqual([packageA, packageC]);
    });

    test("returns no packages when the selection is empty", () => {
        expect(getSelectedPackages(options, new Set())).toEqual([]);
    });
});
