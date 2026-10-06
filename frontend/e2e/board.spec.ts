import { expect, test } from "@playwright/test";

test("shows the dummy board", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Kanban" })).toBeVisible();
  for (const name of ["Backlog", "Ready", "In Progress", "Review", "Done"]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }
  await expect(page.getByText("Draft the Q4 roadmap")).toBeVisible();
  await expect(page.getByText("Scaffold the app")).toBeVisible();
});

test("renames a column", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Backlog" }).click();
  const input = page.getByRole("textbox", { name: "Column name" });
  await input.fill("Ideas");
  await input.press("Enter");
  await expect(page.getByRole("region", { name: "Ideas" })).toBeVisible();
});

test("adds a card to a column", async ({ page }) => {
  await page.goto("/");
  const backlog = page.getByRole("region", { name: "Backlog" });
  await backlog.getByLabel("Title").fill("Playwright card");
  await backlog.getByLabel("Details").fill("Added in the browser");
  await backlog.getByRole("button", { name: "Add card" }).click();
  await expect(backlog.getByRole("heading", { name: "Playwright card" })).toBeVisible();
  await expect(backlog.getByText("Added in the browser")).toBeVisible();
});

test("does not add a card when the title is blank", async ({ page }) => {
  await page.goto("/");
  const backlog = page.getByRole("region", { name: "Backlog" });
  await backlog.getByLabel("Details").fill("No title here");
  await backlog.getByRole("button", { name: "Add card" }).click();
  await expect(backlog.getByRole("heading", { name: "No title here" })).toHaveCount(0);
});

test("deletes a card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Delete Draft the Q4 roadmap", exact: true }).click();
  await expect(page.getByText("Draft the Q4 roadmap")).toHaveCount(0);
});

test("drags a card into the empty part of a column", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("button", { name: "Draft the Q4 roadmap", exact: true });
  const ready = page.getByRole("region", { name: "Ready" });
  const cardBox = await card.boundingBox();
  const readyBox = await ready.boundingBox();
  if (!cardBox || !readyBox) throw new Error("missing drag target");
  const startX = cardBox.x + cardBox.width / 2;
  const startY = cardBox.y + cardBox.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 16, startY + 16, { steps: 5 });
  await page.mouse.move(readyBox.x + readyBox.width / 2, readyBox.y + readyBox.height * 0.45, {
    steps: 25,
  });
  await page.mouse.up();
  await expect(ready.getByText("Draft the Q4 roadmap")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Backlog" }).getByText("Draft the Q4 roadmap"),
  ).toHaveCount(0);
});
