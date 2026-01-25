import { Locator, Page } from "@playwright/test";
import { createDropdownField, DropdownField } from "../utils/dropdownHelpers";
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
    readonly genreField: DropdownField;
    readonly tagsField: DropdownField;

    readonly cancelButton: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page, "");

        this.goBackButton = this.page.getByRole('button', { name: 'Go back' })
        this.addNewBookHeader = this.page.getByRole('heading', { name: 'Add New Book' })

        // Form Text Fields
        this.bookTitleField = createFormField(
            this.page.getByTestId('book-title-field')
        )
        this.authorField = createFormField(
            this.page.getByTestId('author-field')
        )
        this.seriesField = createFormField(
            this.page.getByTestId('series-field')
        )
        this.coverImageField = createFormField(
            this.page.getByTestId('cover-image-field')
        )
        
        // Other Form Fields
        this.ratingField = createRatingField(
            this.page.getByTestId('rating-field')
        );
        this.genreField = createDropdownField(
            this.page.getByTestId('genres-field')
        )
        this.tagsField = createDropdownField(
            this.page.getByTestId('tags-field')
        )

        // Form Buttons
        this.cancelButton = this.page.getByRole('button', { name: 'Cancel' });
        this.submitButton = this.page.getByRole('main').getByRole('button', { name: 'Add Book' })
    }
}