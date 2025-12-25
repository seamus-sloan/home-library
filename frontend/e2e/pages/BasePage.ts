import { Page } from "@playwright/test";
import { waitForResponseStatus } from "../utils/network";

export default class BasePage {
    public page: Page;
    private url: string;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async goto() {
        await this.page.goto(this.url);
    }

    /**
     * @see waitForResponseStatus in network.ts
     */
    async waitForResponseStatus(
    url: string | RegExp,
    options: {
        status?: number | number[];
        timeout?: number;
        returnJson?: boolean;
        method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    } = {},
    ){
        return await waitForResponseStatus(
            { page: this.page },
            url,
            options
        );
    }
}