import test, { expect } from "@playwright/test";
import type { Book } from "../../../src/types.ts";
import FilterDropdown from "../../components/FilterDropdown";
import GalleryPage from "../../pages/GalleryPage";
import "../../utils/assertions";

let galleryPage: GalleryPage;
let filterDropdown: FilterDropdown;

test.beforeEach(async({page}) => {
    galleryPage = new GalleryPage(page);
    filterDropdown = galleryPage.filterDropdown;
    await galleryPage.goto();
});

test("search bar shows results", async() => {
    await test.step("search bar is present", async() => {
        await expect(galleryPage.searchBar).toBeInViewport();
        await expect(galleryPage.searchBar).toHaveText("");
    })

    await test.step("search via book title", async() => {
        const bookTitle = "Pride and Prejudice";
        const bookResults = 1;

        const searchResponse = await galleryPage.search(bookTitle);
        expect(searchResponse.length).toEqual(bookResults);
        await expect(galleryPage.searchResultsInfo).toHaveText(`Found ${bookResults} book`);

        const bookCard = await galleryPage.getBookCard(searchResponse[0]);
        await expect(bookCard).toBeVisible();
    });

    await test.step("clear search bar", async() => {
        // Set up the wait before any interactions - use regex to match /books without search query
        const booksReq = galleryPage.waitForResponseStatus(/\/books(?:\?(?!search=).*)?$/, { method: "GET", returnJson: true, timeout: 15000 });
        
        await galleryPage.searchBar.fill("");
        await galleryPage.searchBar.press("Enter");
        
        // Wait for the response to complete first
        const books = await booksReq as Book[];
        console.log("Books returned:", books);
        expect(books).not.toBeNull();
        expect(books).toBeDefined();
        expect(books.length).toBeGreaterThan(20);
        
        // Then verify UI has updated
        await expect(galleryPage.searchResultsInfo).not.toBeInViewport();
        await expect(galleryPage.bookCards).toHaveAtLeast(20);
    });
    
    await test.step("search via book author", async() => {
        const bookAuthor = "Frank Herbert";
        const bookResults = 3;

        const searchResponse = await galleryPage.search(bookAuthor);
        expect(searchResponse.length).toEqual(bookResults);
        await expect(galleryPage.searchResultsInfo).toHaveText(`Found ${bookResults} books`);

        const bookCard = await galleryPage.getBookCard(searchResponse[0]);
        await expect(bookCard).toBeVisible();
    });
});

test("compounding filters", async() => {
    await test.step("open & validate filter dropdown", async() => {
        await filterDropdown.open();
        await filterDropdown.assertFilterOptions();
    });

    await test.step("add genre filter", async() => {
        const initialCount = await galleryPage.bookCards.count();
        await filterDropdown.selectGenre("Science Fiction");

        await expect(galleryPage.bookCards).not.toHaveCount(initialCount);
        await expect(galleryPage.bookCards).toHaveCount(11);

        // Verify Clear button is visible
        const clearButton = galleryPage.page.getByRole('button', { name: 'Clear' });
        await expect(clearButton).toBeVisible();
    });

    await test.step("add tag filter on top of genre", async() => {
        await filterDropdown.open();
        const afterGenreCount = await galleryPage.bookCards.count();
        await filterDropdown.selectTag("Classic");

        // Should have fewer results (or same) with both filters
        const finalCount = await galleryPage.bookCards.count();
        expect(finalCount).toBeLessThanOrEqual(afterGenreCount);
        expect(finalCount).toBeGreaterThan(0);
    });

    await test.step("clear all filters", async() => {
        await filterDropdown.close();
        await filterDropdown.clearFilters();

        // Verify all filters are cleared and all books are shown again
        await expect(galleryPage.bookCards).toHaveAtLeast(20);

        // Verify Clear button is no longer visible
        const clearButton = galleryPage.page.getByRole('button', { name: 'Clear' });
        await expect(clearButton).not.toBeVisible();
    });
});

test("filter by genre only", async() => {
    await test.step("open filter dropdown", async() => {
        await filterDropdown.open();
    });

    await test.step("select genre filter", async() => {
        const initialCount = await galleryPage.bookCards.count();
        await filterDropdown.selectGenre("Science Fiction");

        await expect(galleryPage.bookCards).not.toHaveCount(initialCount);
        await expect(galleryPage.bookCards).toHaveCount(11);
        await filterDropdown.close();
    });

    await test.step("clear filter", async() => {
        await filterDropdown.clearFilters();
        await expect(galleryPage.bookCards).toHaveAtLeast(20);
    });
});

test("filter by rating only", async() => {
    await test.step("open filter dropdown", async() => {
        await filterDropdown.open();
    });

    await test.step("select rating filter", async() => {
        const initialCount = await galleryPage.bookCards.count();
        await filterDropdown.selectRating(4.5);
        await expect(galleryPage.bookCards).not.toHaveCount(initialCount);
        await expect(galleryPage.bookCards).toHaveCount(8);
        await filterDropdown.close();
    });

    await test.step("clear filter", async() => {
        await filterDropdown.clearFilters();
        await expect(galleryPage.bookCards).toHaveAtLeast(20);
    });
});

test("filter by tag only", async() => {
    await test.step("open filter dropdown", async() => {
        await filterDropdown.open();
    });

    await test.step("select tag filter", async() => {
        const initialCount = await galleryPage.bookCards.count();
        await filterDropdown.selectTag("Classic");

        await expect(galleryPage.bookCards).not.toHaveCount(initialCount);
        await expect(galleryPage.bookCards).toHaveAtLeast(1);
        await filterDropdown.close();
    });

    await test.step("clear filter", async() => {
        await filterDropdown.clearFilters();
        await expect(galleryPage.bookCards).toHaveAtLeast(20);
    });
});
