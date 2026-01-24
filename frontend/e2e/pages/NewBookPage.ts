import { Locator, Page } from "@playwright/test";
import { createFormField, FormField } from "../utils/formFieldHelpers";
import { createRatingField, RatingField } from "../utils/ratingHelpers";
import BasePage from "./BasePage";

export default class NewBookPage extends BasePage {
    readonly goBackButton: Locator;
    readonly addNewBookHeader: Locator;

    readonly bookTitleField: FormField;
    readonly authorField: FormField;
    readonly seriesField: FormField;
    readonly coverImageField: FormField;

    readonly ratingField: RatingField;
    readonly genreField: FormField;
    readonly tagsField: FormField;

    readonly cancelButton: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page, "");

        this.goBackButton = this.page.getByRole('button', { name: 'Go back' })
        this.addNewBookHeader = this.page.getByRole('heading', { name: 'Add New Book' })

        // Form Text Fields
        this.bookTitleField = createFormField(
            this.page.locator('div').filter({ hasText: /^Book Title \*$/ })
        )
        this.authorField = createFormField(
            this.page.locator('div').filter({ hasText: /^Author \*$/ })
        )
        this.seriesField = createFormField(
            this.page.locator('div').filter({ hasText: /^Series$/ })
        )
        this.coverImageField = createFormField(
            this.page.locator('div').filter({ hasText: /^Cover Image URL$/ })
        )
        
        // Other Form Fields
        this.ratingField = createRatingField(
            this.page.locator('div', { has: this.page.getByText('Rating', { exact: true }) })
        );
        // TODO: These should be updated with more specific locators.
        this.genreField = createFormField(
            this.page.locator('div').filter({ hasText: /^Genres$/ })
        )
        this.tagsField = createFormField(
            this.page.locator('div').filter({ hasText: /^Tags$/ })
        )

        // Form Buttons
        this.cancelButton = this.page.getByRole('button', { name: 'Cancel' });
        this.submitButton = this.page.getByRole('main').getByRole('button', { name: 'Add Book' })
    }
}
