import { describe, expect, test } from "vite-plus/test";
import { alsaPackageName } from "./password-manager";

describe("PasswordManager", () => {
    describe("alsaPackageName", () => {
        test("selects the renamed package on Ubuntu 24.04 and later", () => {
            expect(alsaPackageName('NAME="Ubuntu"\nVERSION_ID="24.04"')).toBe("libasound2t64");
            expect(alsaPackageName('NAME="Ubuntu"\nVERSION_ID="26.04"')).toBe("libasound2t64");
        });

        test("selects the original package on earlier releases", () => {
            expect(alsaPackageName('NAME="Ubuntu"\nVERSION_ID="22.04"')).toBe("libasound2");
            expect(alsaPackageName('NAME="Ubuntu"\nVERSION_ID="20.04"')).toBe("libasound2");
        });
    });
});
