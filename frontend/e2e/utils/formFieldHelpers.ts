import { Locator } from "@playwright/test";

export type FormField = {
    root: Locator;
    label: Locator;
    input: Locator;
}

export const createFormField = (root: Locator): FormField => {
    return {
        root,
        label: root.locator('label'),
        input: root.getByRole('textbox')
    };
};