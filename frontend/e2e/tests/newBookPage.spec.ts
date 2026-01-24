import test, { expect } from "@playwright/test";
import { Book } from "../../src/types";
import GalleryPage from "../pages/GalleryPage";
import NewBookPage from "../pages/NewBookPage";

let newBookPage: NewBookPage;
let galleryPage: GalleryPage;

test.beforeEach(async({ page }) => {
    galleryPage = new GalleryPage(page);
    await galleryPage.goto();
    await galleryPage.headerBar.addBookButton.click();
    newBookPage = new NewBookPage(page);
});

test("validate new book page elements", async() => {
    // The scrolling here is a bit egregious, but simplifies the guessing for mobile tests
    await newBookPage.addNewBookHeader.scrollIntoViewIfNeeded();
    await expect(newBookPage.addNewBookHeader).toBeInViewport();

    await newBookPage.goBackButton.scrollIntoViewIfNeeded();
    await expect(newBookPage.goBackButton).toBeInViewport();

    await newBookPage.bookTitleField.input.scrollIntoViewIfNeeded();
    await expect(newBookPage.bookTitleField.input).toBeInViewport();

    await newBookPage.bookTitleField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.bookTitleField.label).toBeInViewport();

    await newBookPage.authorField.input.scrollIntoViewIfNeeded();
    await expect(newBookPage.authorField.input).toBeInViewport();

    await newBookPage.authorField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.authorField.label).toBeInViewport();

    await newBookPage.seriesField.input.scrollIntoViewIfNeeded();
    await expect(newBookPage.seriesField.input).toBeInViewport();

    await newBookPage.seriesField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.seriesField.label).toBeInViewport();

    await newBookPage.coverImageField.input.scrollIntoViewIfNeeded();
    await expect(newBookPage.coverImageField.input).toBeInViewport();

    await newBookPage.coverImageField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.coverImageField.label).toBeInViewport();

    await newBookPage.ratingField.stars.first().scrollIntoViewIfNeeded();
    await expect(newBookPage.ratingField.stars).toHaveCount(10);

    await newBookPage.ratingField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.ratingField.label).toBeInViewport();

    await newBookPage.genreField.input.scrollIntoViewIfNeeded();
    await expect(newBookPage.genreField.input).toBeInViewport();

    await newBookPage.genreField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.genreField.label).toBeInViewport();

    await newBookPage.tagsField.input.scrollIntoViewIfNeeded();
    await expect(newBookPage.tagsField.input).toBeInViewport();

    await newBookPage.tagsField.label.scrollIntoViewIfNeeded();
    await expect(newBookPage.tagsField.label).toBeInViewport();

    await newBookPage.cancelButton.scrollIntoViewIfNeeded();
    await expect(newBookPage.cancelButton).toBeInViewport();

    await newBookPage.submitButton.scrollIntoViewIfNeeded();
    await expect(newBookPage.submitButton).toBeInViewport();

});

test("add a new book with valid details", async() => {
    const bookTitle = `E2E Book ${Date.now()}`;
    const bookAuthor = "E2E Author";
    const bookSeries = "E2E Series";
    const bookCoverImage = "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1719736668i/201116293.jpg";
    const bookRating = 4; // out of 5
    let book: Book;

    await test.step("fill out form", async() => {
        await newBookPage.bookTitleField.input.fill(bookTitle);
        await newBookPage.authorField.input.fill(bookAuthor);
        await newBookPage.seriesField.input.fill(bookSeries);
        await newBookPage.coverImageField.input.fill(bookCoverImage);
    })

    await test.step("submit form", async() => {
        const addBookResponse = newBookPage.waitForResponseStatus(/\/books$/, { method: "POST", returnJson: true, timeout: 15000 });
        await newBookPage.submitButton.click();
        book = await addBookResponse;
    })

    await test.step("validate navigation & book in gallery", async() => {
        await newBookPage.page.waitForURL("/");

        const addedBookCard = await galleryPage.getBookCard(book);
        await expect(addedBookCard).toBeVisible();
    });
});

test("add a new book with missing fields", async() => {});