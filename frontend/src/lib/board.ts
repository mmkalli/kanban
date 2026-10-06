export type Card = { id: string; title: string; details: string };
export type Column = { id: string; name: string; cards: Card[] };
export type Board = { columns: Column[] };

export const initialBoard: Board = {
  columns: [
    {
      id: "backlog",
      name: "Backlog",
      cards: [
        {
          id: "card-roadmap",
          title: "Draft the Q4 roadmap",
          details: "Outline the themes and the bets we will not take.",
        },
        {
          id: "card-research",
          title: "Interview three customers",
          details: "Focus on how they move work between teams today.",
        },
      ],
    },
    {
      id: "ready",
      name: "Ready",
      cards: [
        {
          id: "card-copy",
          title: "Write the launch copy",
          details: "Headline, short description, and the empty-state line.",
        },
      ],
    },
    {
      id: "progress",
      name: "In Progress",
      cards: [
        {
          id: "card-board",
          title: "Build the board layout",
          details: "Five columns, generous spacing, and a clear type hierarchy.",
        },
        {
          id: "card-motion",
          title: "Tune card motion",
          details: "Keep drags immediate and avoid extra animation.",
        },
      ],
    },
    {
      id: "review",
      name: "Review",
      cards: [
        {
          id: "card-palette",
          title: "Check the color pass",
          details: "Navy headings, yellow rules, purple actions.",
        },
      ],
    },
    {
      id: "done",
      name: "Done",
      cards: [
        {
          id: "card-scaffold",
          title: "Scaffold the app",
          details: "Next.js client app in the frontend directory.",
        },
      ],
    },
  ],
};

export function renameColumn(board: Board, columnId: string, name: string): Board {
  const trimmed = name.trim();
  if (!trimmed) return board;
  return {
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, name: trimmed } : column,
    ),
  };
}

export function addCard(
  board: Board,
  columnId: string,
  title: string,
  details: string,
): Board {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return board;
  const card: Card = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    details: details.trim(),
  };
  return {
    columns: board.columns.map((column) =>
      column.id === columnId
        ? { ...column, cards: [...column.cards, card] }
        : column,
    ),
  };
}

export function deleteCard(board: Board, cardId: string): Board {
  return {
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    })),
  };
}

export function preferredDropId(hitIds: string[], columnIds: string[]): string | null {
  const columns = new Set(columnIds);
  return hitIds.find((id) => !columns.has(id)) ?? hitIds.find((id) => columns.has(id)) ?? null;
}

export function resolveDrop(
  board: Board,
  _cardId: string,
  overId: string,
): { toColumnId: string; toIndex: number } | null {
  const overColumn = board.columns.find((column) => column.id === overId);
  if (overColumn) {
    return { toColumnId: overColumn.id, toIndex: overColumn.cards.length };
  }
  const target = board.columns.find((column) =>
    column.cards.some((card) => card.id === overId),
  );
  if (!target) return null;
  return {
    toColumnId: target.id,
    toIndex: target.cards.findIndex((card) => card.id === overId),
  };
}

export function moveCard(
  board: Board,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Board {
  const fromColumn = board.columns.find((column) =>
    column.cards.some((card) => card.id === cardId),
  );
  if (!fromColumn) return board;
  const fromIndex = fromColumn.cards.findIndex((card) => card.id === cardId);
  const card = fromColumn.cards[fromIndex];
  if (fromColumn.id === toColumnId && fromIndex === toIndex) return board;

  return {
    columns: board.columns.map((column) => {
      if (column.id === fromColumn.id && column.id === toColumnId) {
        const cards = column.cards.filter((item) => item.id !== cardId);
        const index = Math.min(Math.max(toIndex, 0), cards.length);
        cards.splice(index, 0, card);
        return { ...column, cards };
      }
      if (column.id === fromColumn.id) {
        return {
          ...column,
          cards: column.cards.filter((item) => item.id !== cardId),
        };
      }
      if (column.id === toColumnId) {
        const cards = [...column.cards];
        const index = Math.min(Math.max(toIndex, 0), cards.length);
        cards.splice(index, 0, card);
        return { ...column, cards };
      }
      return column;
    }),
  };
}
