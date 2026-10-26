import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about/",
  "/disciplines/",
  "/athletes/",
  "/coaches-and-judges/",
  "/governance/",
  "/team/",
  "/competitions/",
  "/news/",
  "/join/",
  "/contact/",
  "/privacy/",
  "/terms/",
] as const;

test("renders the proposed-status foundation without critical axe findings", async ({
  page,
}) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByText("Proposed organisation · In development").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Movement needs momentum. Progress needs structure.",
    }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
});

test("serves every public route with its core content before enhancement", async ({
  page,
}) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const browserErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} — ${
        request.failure()?.errorText ?? "unknown failure"
      }`,
    );
  });

  for (const route of publicRoutes) {
    await test.step(route, async () => {
      const response = await page.goto(route);

      expect(response?.status(), `${route} response status`).toBe(200);
      await expect(page.locator("main#main-content")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
        `${route} horizontal overflow`,
      ).toBe(true);
    });
  }

  expect(browserErrors, "browser console and page errors").toEqual([]);
  expect(failedRequests, "failed browser requests").toEqual([]);
});

test("keeps key institutional and form pages free of serious axe findings", async ({
  page,
}) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const route of ["/governance/", "/join/", "/contact/"] as const) {
    await test.step(route, async () => {
      await page.goto(route);

      if (route === "/join/") {
        await expect(
          page.getByRole("heading", {
            level: 2,
            name: "Register interest is not open",
          }),
        ).toBeVisible();
      }

      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.filter(
          ({ impact }) => impact === "critical" || impact === "serious",
        ),
        `${route} serious or critical axe violations`,
      ).toEqual([]);
    });
  }
});

test("provides a branded hard 404 without deploying publication sentinels", async ({
  page,
}) => {
  test.slow();
  for (const route of [
    "/route-that-does-not-exist/",
    "/athletes/profiles-not-published/",
    "/news/updates-not-published/",
  ] as const) {
    await test.step(route, async () => {
      const response = await page.goto(route);

      expect(response?.status(), `${route} response status`).toBe(404);
      await expect(
        page.getByRole("heading", { level: 1, name: "The count stops here" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Return home" }),
      ).toHaveAttribute("href", "/");
    });
  }
});

test("opens and dismisses the keyboard-accessible mobile navigation", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.use.isMobile,
    "Mobile navigation is hidden at desktop breakpoints.",
  );

  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Menu" });
  await trigger.focus();
  await trigger.press("Enter");

  await expect(
    page.getByRole("dialog", { name: "Site navigation" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Site navigation" }),
  ).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("keeps the unconfigured enquiry service explicitly unavailable", async ({
  request,
}) => {
  const statusResponse = await request.get("/api/enquiries/status");

  expect(statusResponse.status()).toBe(200);
  expect(statusResponse.headers()["cache-control"]).toBe("no-store");
  const statusBody: unknown = await statusResponse.json();
  expect(statusBody).toMatchObject({
    available: false,
    reason:
      "The enquiry service is not open because its responsible handling configuration is incomplete.",
  });

  const submissionResponse = await request.post("/api/enquiries", {
    headers: { "Content-Type": "application/json" },
    data: {},
  });

  expect(submissionResponse.status()).toBe(503);
  expect(submissionResponse.headers()["retry-after"]).toBe("300");
  const submissionBody: unknown = await submissionResponse.json();
  expect(submissionBody).toMatchObject({
    ok: false,
    error: { code: "FORM_SERVICE_UNAVAILABLE", retryable: true },
  });
});

test("rejects unsupported API methods and unknown endpoints", async ({
  request,
}) => {
  const methodResponse = await request.post("/api/enquiries/status", {
    data: {},
  });
  expect(methodResponse.status()).toBe(405);
  expect(methodResponse.headers().allow).toBe("GET");

  const unknownResponse = await request.get("/api/not-real");
  expect(unknownResponse.status()).toBe(404);
  const unknownBody: unknown = await unknownResponse.json();
  expect(unknownBody).toMatchObject({
    ok: false,
    error: { code: "NOT_FOUND", retryable: false },
  });
});
