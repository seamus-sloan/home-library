import { Locator, Page } from "@playwright/test";
import { Book } from "../../src/types";
import FilterDropdown from "../components/FilterDropdown";
import HeaderBar from "../components/HeaderBar";
import BasePage from "./BasePage";

export default class GalleryPage extends BasePage {
    readonly headerBar: HeaderBar;
    readonly filterDropdown: FilterDropdown;

    readonly searchBar: Locator;
    readonly searchResultsInfo: Locator;
    readonly bookCards: Locator;

    constructor(page: Page) {
        super(page, "/");

        this.headerBar = new HeaderBar(page);
        this.filterDropdown = new FilterDropdown(page);

        this.searchBar = page.getByRole('textbox', { name: 'Search by title or author...' });
        this.searchResultsInfo = page.getByTestId('search-results-info');
        this.bookCards = page.getByTestId(/book-card-/);
    }

    async getBookCard(book: Book): Promise<Locator> {
        return this.page.getByTestId(`book-card-${book.title}`);
    }

    /**
     * Enters a search term into the search bar and returns the search results.
     * @param searchTerm 
     */
    async search(searchTerm: string): Promise<Book[]> {
        const searchRequest = this.waitForResponseStatus(/\/books\?search=/, { method: "GET", returnJson: true });
        await this.searchBar.fill(searchTerm);
        await this.searchBar.press("Enter");
        return await searchRequest as Book[];;
    }
}