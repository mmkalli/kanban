import { describe, expect, it } from "vitest";
import {
  addCard,
  deleteCard,
  initialBoard,
  moveCard,
  renameColumn,
  preferredDropId,
  resolveDrop,
} from "./board";

describe("initialBoard", () => {
  it("opens with five named columns that already have cards", () => {
    expect(initialBoard.columns).toHaveLength(5);
    expect(initialBoard.columns.map((column) => column.name)).toEqual([
      "Backlog",
      "Ready",
      "In Progress",
      "Review",
      "Done",
    ]);
    expect(initialBoard.columns.every((column) => column.cards.length > 0)).toBe(
      true,
    );
  });
});

describe("renameColumn", () => {
  it("trims the new name", () => {
    const columnId = initialBoard.columns[0].id;
    const next = renameColumn(initialBoard, columnId, "  Ideas  ");
    expect(next.columns[0].name).toBe("Ideas");
  });

  it("keeps the previous name when the rename is blank", () => {
    const columnId = initialBoard.columns[0].id;
    const next = renameColumn(initialBoard, columnId, "   ");
    expect(next.columns[0].name).toBe("Backlog");
    expect(next).toEqual(initialBoard);
  });
});

describe("addCard", () => {
  it("appends a trimmed card with a unique id", () => {
    const columnId = initialBoard.columns[0].id;
    const before = initialBoard.columns[0].cards.length;
    const next = addCard(initialBoard, columnId, "  Ship it  ", "  notes  ");
    const cards = next.columns[0].cards;
    expect(cards).toHaveLength(before + 1);
    const added = cards[cards.length - 1];
    expect(added.title).toBe("Ship it");
    expect(added.details).toBe("notes");
    expect(added.id.length).toBeGreaterThan(0);
    expect(initialBoard.columns.flatMap((column) => column.cards).map((card) => card.id)).not.toContain(
      added.id,
    );
  });

  it("does not create a card when the title is blank", () => {
    const next = addCard(initialBoard, initialBoard.columns[0].id, "   ", "details");
    expect(next).toEqual(initialBoard);
  });
});

describe("deleteCard", () => {
  it("removes the card from whichever column holds it", () => {
    const card = initialBoard.columns[2].cards[0];
    const next = deleteCard(initialBoard, card.id);
    const stillThere = next.columns
      .flatMap((column) => column.cards)
      .some((item) => item.id === card.id);
    expect(stillThere).toBe(false);
    expect(next.columns[2].cards).toHaveLength(initialBoard.columns[2].cards.length - 1);
  });

  it("leaves the column in place after its last card is deleted", () => {
    let board = initialBoard;
    const column = board.columns[4];
    for (const card of column.cards) {
      board = deleteCard(board, card.id);
    }
    expect(board.columns).toHaveLength(5);
    expect(board.columns[4].id).toBe(column.id);
    expect(board.columns[4].cards).toEqual([]);
  });
});

describe("preferredDropId", () => {
  it("prefers a card when the pointer is also inside its column", () => {
    expect(preferredDropId(["ready", "card-copy"], ["ready", "backlog"])).toBe("card-copy");
  });

  it("uses the column when the pointer is in empty column space", () => {
    expect(preferredDropId(["ready"], ["ready", "backlog"])).toBe("ready");
  });
});

describe("resolveDrop", () => {
  it("targets a card's column and index", () => {
    const card = initialBoard.columns[1].cards[0];
    expect(resolveDrop(initialBoard, initialBoard.columns[0].cards[0].id, card.id)).toEqual({
      toColumnId: initialBoard.columns[1].id,
      toIndex: 0,
    });
  });

  it("appends when the drop target is a column", () => {
    expect(
      resolveDrop(initialBoard, initialBoard.columns[0].cards[0].id, initialBoard.columns[1].id),
    ).toEqual({
      toColumnId: initialBoard.columns[1].id,
      toIndex: initialBoard.columns[1].cards.length,
    });
  });

  it("uses index 0 when the drop target is an empty column", () => {
    let board = initialBoard;
    for (const card of [...board.columns[4].cards]) {
      board = deleteCard(board, card.id);
    }
    expect(resolveDrop(board, board.columns[0].cards[0].id, board.columns[4].id)).toEqual({
      toColumnId: board.columns[4].id,
      toIndex: 0,
    });
  });
});

describe("moveCard", () => {
  it("moves a card into another column at the requested index", () => {
    const card = initialBoard.columns[0].cards[0];
    const targetId = initialBoard.columns[1].id;
    const next = moveCard(initialBoard, card.id, targetId, 0);
    expect(next.columns[0].cards.some((item) => item.id === card.id)).toBe(false);
    expect(next.columns[1].cards[0].id).toBe(card.id);
  });

  it("returns an equal board when the card is dropped on its current index", () => {
    const column = initialBoard.columns[0];
    const card = column.cards[1];
    const next = moveCard(initialBoard, card.id, column.id, 1);
    expect(next).toEqual(initialBoard);
  });

  it("inserts into an empty column at index 0 and removes it from the source", () => {
    let board = initialBoard;
    const emptyId = board.columns[4].id;
    for (const card of [...board.columns[4].cards]) {
      board = deleteCard(board, card.id);
    }
    const moving = board.columns[0].cards[0];
    const next = moveCard(board, moving.id, emptyId, 0);
    const destination = next.columns.find((column) => column.id === emptyId);
    expect(destination?.cards).toEqual([moving]);
    expect(next.columns[0].cards.some((card) => card.id === moving.id)).toBe(false);
  });
});
