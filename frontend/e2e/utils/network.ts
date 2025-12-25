import type { Page } from "@playwright/test";

/**
 * Intercept a request that the website is already making, allow the endpoint to continue,
 * and return the response.
 * @note THIS IS ALREADY A JSON.
 * @param obj Page/Component Object
 * @param urlPattern The pattern for the request.
 * @returns JSON object of the response
 */
export async function interceptRequest(obj: { page: Page }, urlPattern: string): Promise<unknown> {
  return new Promise((resolve) => {
    obj.page.route(urlPattern, async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      route.continue();
      resolve(json);
    });
  });
}

/**
 * Fulfills a request with the specified options.
 * @param obj Page/Component Object
 * @param urlPattern The URL pattern to match for the request.
 * @param options The options to use for fulfilling the request.
 */
export async function fulfillRequest(
  obj: { page: Page },
  urlPattern: string,
  options?: {
    status?: number;
    contentType?: string;
    body?: unknown;
  },
): Promise<void> {
  await obj.page.route(urlPattern, async (route) => {
    await route.fulfill({
      status: options?.status ?? 200,
      contentType: options?.contentType ?? "application/json",
      body: JSON.stringify(options?.body ?? {}),
    });
  });
}

/**
 * Wait for a particular response to occur and return the correct response.
 * @param obj Page/Component Object
 * @param url URL of the request you are expecting
 * @param options Configuration options for the response wait
 * @returns The response object or JSON data if specified
 */
export async function waitForResponseStatus(
  obj: { page: Page },
  url: string | RegExp,
  options: {
    status?: number | number[];
    timeout?: number;
    returnJson?: boolean;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  } = {},
) {
  const { status = 200, timeout = 5_000, returnJson = true, method = null } = options;

  try {
    const response = await obj.page.waitForResponse(
      (res) => {
        const responseUrl = res.url();
        const requestMethod = res.request().method();

        // Check if URL matches
        const urlMatches =
          typeof url === "string" ? responseUrl.includes(url) : url.test(responseUrl);

        // If method is specified, it must match; otherwise just check URL
        if (method) return requestMethod === method && urlMatches;
        else return urlMatches;
      },
      { timeout },
    );

    // Check if response status matches expected status(es)
    const expectedStatuses = Array.isArray(status) ? status : [status];
    const responseStatus = response.status();

    if (!expectedStatuses.includes(responseStatus)) {
      throw new Error(
        `Expected status ${expectedStatuses.join(", ")} but got ${responseStatus} from ${url}`,
      );
    }

    // In some cases, we only want to return the Response object rather than the JSON.
    if (returnJson) {
      // Check if response has content and is JSON
      const contentType = response.headers()["content-type"] || "";
      const hasContent = responseStatus !== 204;

      if (hasContent && contentType.includes("application/json")) {
        try {
          return await response.json();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to parse JSON response from ${url}: ${message}`);
        }
      } else {
        console.error(
          `Couldn't turn response from ${url} into JSON (Content-Type: ${contentType}). Returning null instead. If this was intentional, set returnJson to false.`,
        );
        return null;
      }
    } else {
      return response;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`Timed out waiting for response from ${url} after ${timeout}ms`);
    }
    throw error;
  }
}