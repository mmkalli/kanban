"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  addCard,
  deleteCard,
  initialBoard,
  moveCard,
  preferredDropId,
  renameColumn,
  resolveDrop,
  type Board as BoardState,
  type Card,
} from "@/lib/board";
import { CardShell } from "@/components/Card";
import { ColumnView } from "@/components/Column";

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
  const columnIds = args.droppableContainers
    .filter((container) => container.data.current?.type === "column")
    .map((container) => String(container.id));
  const chosen = preferredDropId(
    hits.map((hit) => String(hit.id)),
    columnIds,
  );
  if (!chosen) return [];
  return hits.filter((hit) => String(hit.id) === chosen);
};

export function Board() {
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [dragging, setDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => setDragging(true), []);
  const activeCard = board.columns
    .flatMap((column) => column.cards)
    .find((card) => card.id === activeId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function placeCard(current: BoardState, cardId: string, overId: string) {
    const target = resolveDrop(current, cardId, overId);
    if (!target) return current;
    return moveCard(current, cardId, target.toColumnId, target.toIndex);
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const cardId = String(active.id);
    const overId = String(over.id);
    setBoard((current) => {
      const from = current.columns.find((column) =>
        column.cards.some((card) => card.id === cardId),
      );
      const target = resolveDrop(current, cardId, overId);
      if (!from || !target || from.id === target.toColumnId) return current;
      return moveCard(current, cardId, target.toColumnId, target.toIndex);
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const cardId = String(active.id);
    const overId = String(over.id);
    setBoard((current) => placeCard(current, cardId, overId));
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b-[3px] border-accent bg-white px-8 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Project
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-navy">Kanban</h1>
        <p className="mt-1 text-sm text-label">One board for the work in front of you.</p>
      </header>
      <BoardColumns
        board={board}
        dragging={dragging}
        sensors={sensors}
        activeCard={activeCard}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
        onRename={(columnId, name) =>
          setBoard((current) => renameColumn(current, columnId, name))
        }
        onAdd={(columnId, title, details) =>
          setBoard((current) => addCard(current, columnId, title, details))
        }
        onDelete={(cardId) => setBoard((current) => deleteCard(current, cardId))}
      />
    </div>
  );
}

function BoardColumns({
  board,
  dragging,
  sensors,
  activeCard,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  onRename,
  onAdd,
  onDelete,
}: {
  board: BoardState;
  dragging: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  activeCard: Card | undefined;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  onRename: (columnId: string, name: string) => void;
  onAdd: (columnId: string, title: string, details: string) => void;
  onDelete: (cardId: string) => void;
}) {
  const columns = (
    <div className="grid min-h-0 flex-1 grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto px-6 py-5">
      {board.columns.map((column) => (
        <ColumnView
          key={column.id}
          column={column}
          dragging={dragging}
          onRename={(name) => onRename(column.id, name)}
          onAdd={(title, details) => onAdd(column.id, title, details)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );

  if (!dragging) return columns;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {columns}
      <DragOverlay>
        {activeCard ? <CardShell card={activeCard} onDelete={() => undefined} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
