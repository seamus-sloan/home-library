import { Page } from "@playwright/test";
import BaseComponent from "./BaseComponent";

export default class ProfileEditor extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }
}