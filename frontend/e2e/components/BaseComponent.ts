import { Page } from "@playwright/test";

export default class BaseComponent {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }
}