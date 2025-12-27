import { Page } from "@playwright/test";
import BaseComponent from "./BaseComponent";

export default class ProfileDropdown extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }
}