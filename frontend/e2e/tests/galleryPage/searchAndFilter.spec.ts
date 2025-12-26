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
        const booksReq = galleryPage.waitForResponseStatus("/books", { method: "GET", returnJson: true });

        await galleryPage.searchBar.fill("");
        await galleryPage.searchBar.press("Enter");
        const books = await booksReq as Book[];
        
        expect(books.length).toBeGreaterThan(20);
        await expect(galleryPage.searchResultsInfo).not.toBeInViewport();
        await expect(galleryPage.bookCards).toHaveAtLeast(20);
    });
    
    await test.step("search via book author", async() => {
        const bookAuthor = "Frank Herbert";
        const bookResults = 3;
        const searchRequest = galleryPage.waitForResponseStatus(/\/books\?search=/, { method: "GET", returnJson: true });

        await galleryPage.searchBar.fill(bookAuthor);
        await galleryPage.searchBar.press("Enter");

        const searchResults = await searchRequest as Book[];
        expect(searchResults.length).toEqual(bookResults);
    });
});

test("filtering shows results", async() => {

});