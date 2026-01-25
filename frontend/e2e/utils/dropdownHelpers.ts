import { expect, Locator } from "@playwright/test";

export type DropdownField = {
    root: Locator;
    label: Locator;
    textInput: Locator;
    dropdown: Locator;
};

export const createDropdownField = (root: Locator): DropdownField => {
    return {
        root,
        label: root.locator('label'),
        textInput: root.getByRole('textbox'),
        dropdown: root.getByTestId('category-search-dropdown').getByRole("button")
    };
}

/**
 * Enters the desired option in the text field, then selects it from the dropdown.
 * @param field The field to interact with (DropdownField)
 * @param option The option to select (string)
 */
export async function selectDropdownOption(field: DropdownField, option: string): Promise<void> {
    await field.textInput.fill(option);

    const dropdownOption = field.dropdown.getByText(option);
    await dropdownOption.scrollIntoViewIfNeeded();
    await expect(dropdownOption).toBeInViewport();
    await dropdownOption.click();

    await field.label.click(); // Defocus input
}