import { Locator } from "@playwright/test";

export type RatingField = {
    root: Locator;
    label: Locator;
    stars: Locator;
}

export const createRatingField = (root: Locator): RatingField => {
    return {
        root,
        label: root.getByText('Rating', { exact: true }),
        stars: root.getByRole('radio')
    };
};

// TODO: This function does not work since the stars are "hidden". Would take a bit
// more time to figure out how to properly click the stars based on rating value.
export function setRating(field: RatingField, rating: number): Promise<void> {
  const index = Math.round(rating * 2) - 1
  return field.root.locator('.MuiRating-icon').nth(index).click()
}



