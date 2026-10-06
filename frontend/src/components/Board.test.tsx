import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Board } from "@/components/Board";

describe("Board", () => {
  it("shows the five columns and dummy cards", () => {
    render(<Board />);
    expect(screen.getByRole("heading", { name: "Kanban" })).toBeInTheDocument();
    for (const name of ["Backlog", "Ready", "In Progress", "Review", "Done"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
    expect(screen.getByText("Draft the Q4 roadmap")).toBeInTheDocument();
    expect(screen.getByText("Scaffold the app")).toBeInTheDocument();
  });

  it("renames a column from its heading", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByRole("textbox", { name: "Column name" });
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");
    expect(screen.getByRole("region", { name: "Ideas" })).toBeInTheDocument();
  });

  it("keeps the column name when the rename is blank", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByRole("textbox", { name: "Column name" });
    await user.clear(input);
    await user.type(input, "   {Enter}");
    expect(screen.getByRole("region", { name: "Backlog" })).toBeInTheDocument();
  });

  it("adds a card to the column", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const backlog = screen.getByRole("region", { name: "Backlog" });
    await user.type(within(backlog).getByLabelText("Title"), "New task");
    await user.type(within(backlog).getByLabelText("Details"), "Some notes");
    await user.click(within(backlog).getByRole("button", { name: "Add card" }));
    expect(within(backlog).getByText("New task")).toBeInTheDocument();
    expect(within(backlog).getByText("Some notes")).toBeInTheDocument();
  });

  it("does not add a card when the title is blank", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const backlog = screen.getByRole("region", { name: "Backlog" });
    await user.type(within(backlog).getByLabelText("Details"), "Orphan notes");
    await user.click(within(backlog).getByRole("button", { name: "Add card" }));
    expect(
      within(backlog).queryByRole("heading", { name: "Orphan notes" }),
    ).not.toBeInTheDocument();
  });

  it("deletes a card", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(
      screen.getByRole("button", { name: "Delete Draft the Q4 roadmap" }),
    );
    expect(screen.queryByText("Draft the Q4 roadmap")).not.toBeInTheDocument();
  });
});
