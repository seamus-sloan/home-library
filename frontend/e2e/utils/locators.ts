import { Locator } from "@playwright/test";

export type FormField = {
    root: Locator;
    label: Locator;
    input: Locator;
}

export type RatingField = {
    root: Locator;
    label: Locator;
    stars: Locator;
}

export const createFormField = (root: Locator): FormField => {
    return {
        root,
        label: root.locator('label'),
        input: root.getByRole('textbox')
    };
};

export const createRatingField = (root: Locator): RatingField => {
    return {
        root,
        label: root.getByText('Rating', { exact: true }),
        stars: root.locator('label').filter({ hasText: 'Star' })
    };
};