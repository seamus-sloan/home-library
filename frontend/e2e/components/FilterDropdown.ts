import { Page } from "@playwright/test";
import BaseComponent from "./BaseComponent";

export default class FilterDropdown extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }
}