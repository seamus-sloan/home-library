import { expect, Locator, Page } from "@playwright/test";
import BaseComponent from "./BaseComponent";

export default class FilterDropdown extends BaseComponent {
    readonly button: Locator;
    readonly genreTitle: Locator;
    readonly genreDropdown: Locator;
    readonly ratingTitle: Locator;
    readonly ratingDropdown: Locator;
    readonly tagsTitle: Locator;
    readonly tagsDropdown: Locator;

    constructor(page: Page) {
        super(page);

        this.button = this.page.getByRole('button', { name: 'Filter' })
        this.genreTitle = this.page.getByTestId('genre-label')
        this.genreDropdown = this.page.getByTestId('genre-dropdown')
        this.ratingTitle = this.page.getByTestId('rating-label')
        this.ratingDropdown = this.page.getByTestId('rating-dropdown')
        this.tagsTitle = this.page.getByTestId('tags-label')
        this.tagsDropdown = this.page.getByTestId('tags-dropdown')
    }

    async open(): Promise<void> {
        // Only click if dropdown is not already open
        const isOpen = await this.genreDropdown.isVisible();
        if (!isOpen) {
            await this.button.click();
            await expect(this.genreDropdown).toBeVisible();
        }
    }

    async close(): Promise<void> {
        // Only click if dropdown is currently open
        const isOpen = await this.genreDropdown.isVisible();
        if (isOpen) {
            await this.button.click();
            await expect(this.genreDropdown).not.toBeVisible();
        }
    }

    /**
     * Asserts that all filter options are present in the dropdown.
     */
    async assertFilterOptions(): Promise<void> {
        await Promise.all([
            expect(this.genreTitle).toBeInViewport(),
            expect(this.genreTitle).toHaveText('Genre'),

            expect(this.genreDropdown).toBeInViewport(),
            expect(this.genreDropdown).toHaveValue(""),

            expect(this.ratingTitle).toBeInViewport(),
            expect(this.ratingTitle).toHaveText('Rating'),

            expect(this.ratingDropdown).toBeInViewport(),
            expect(this.ratingDropdown).toHaveValue(""),

            expect(this.tagsTitle).toBeInViewport(),
            expect(this.tagsTitle).toHaveText('Tags'),

            expect(this.tagsDropdown).toBeInViewport(),
            expect(this.tagsDropdown).toHaveValue(""),
        ]);
    }

    /**
     * Selects a genre from the genre dropdown.
     */
    async selectGenre(genre: string): Promise<void> {
        await expect(this.genreDropdown).toBeVisible();
        await this.genreDropdown.selectOption(genre);
    }

    /**
     * Selects a rating from the rating dropdown by value.
     */
    async selectRating(rating: number): Promise<void> {
        await expect(this.ratingDropdown).toBeVisible();
        await this.ratingDropdown.selectOption(rating.toString());
    }

    /**
     * Selects a rating from the rating dropdown by index (0-based, where 0 is "All Ratings").
     */
    async selectRatingByIndex(index: number): Promise<void> {
        await expect(this.ratingDropdown).toBeVisible();
        await this.ratingDropdown.selectOption({ index });
    }

    /**
     * Selects a tag from the tags dropdown.
     */
    async selectTag(tag: string): Promise<void> {
        await expect(this.tagsDropdown).toBeVisible();
        await this.tagsDropdown.selectOption(tag);
    }

    /**
     * Clicks the clear filters button.
     */
    async clearFilters(): Promise<void> {
        const clearButton = this.page.getByRole('button', { name: 'Clear' });
        await clearButton.click();
    }
}