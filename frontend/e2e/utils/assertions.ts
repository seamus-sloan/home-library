import { expect, type Locator } from "@playwright/test";

export const customMatchers = {
    async toHaveAtLeast(locator: Locator, expected: number) {
        const assertionName = "toHaveAtLeast";
        let pass: boolean;
        let matcherResult: any;

        try {
            const actualCount = await locator.count();
            pass = actualCount >= expected;

            matcherResult = {
                message: () =>
                    pass
                        ? `Expected locator not to have at least ${expected} elements, but found ${actualCount}`
                        : `Expected locator to have at least ${expected} elements, but found ${actualCount}`,
                pass,
                name: assertionName,
                expected,
                actual: actualCount,
            };
        } catch (e: any) {
            matcherResult = {
                message: () => `${assertionName} failed: ${e.message}`,
                pass: false,
                name: assertionName,
            };
        }

        return matcherResult;
    },

    async toHaveAtMost(locator: Locator, expected: number) {
        const assertionName = "toHaveAtMost";
        let pass: boolean;
        let matcherResult: any;

        try {
            const actualCount = await locator.count();
            pass = actualCount <= expected;

            matcherResult = {
                message: () =>
                    pass
                        ? `Expected locator not to have at most ${expected} elements, but found ${actualCount}`
                        : `Expected locator to have at most ${expected} elements, but found ${actualCount}`,
                pass,
                name: assertionName,
                expected,
                actual: actualCount,
            };
        } catch (e: any) {
            matcherResult = {
                message: () => `${assertionName} failed: ${e.message}`,
                pass: false,
                name: assertionName,
            };
        }

        return matcherResult;
    },
};

// Extend Playwright's expect with custom matchers
expect.extend(customMatchers);

// Type definitions for custom matchers
declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            toHaveAtLeast(count: number): R;
            toHaveAtMost(count: number): R;
        }
    }
}
