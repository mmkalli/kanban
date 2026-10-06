"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column } from "@/lib/board";
import { CardShell, SortableCard } from "@/components/Card";

type ColumnViewProps = {
  column: Column;
  dragging: boolean;
  onRename: (name: string) => void;
  onAdd: (title: string, details: string) => void;
  onDelete: (cardId: string) => void;
};

export function ColumnView({
  column,
  dragging,
  onRename,
  onAdd,
  onDelete,
}: ColumnViewProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.name);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const skipBlur = useRef(false);

  function commitName(name: string) {
    onRename(name);
    setEditing(false);
  }

  function onNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitName(draft);
    }
    if (event.key === "Escape") {
      skipBlur.current = true;
      setDraft(column.name);
      setEditing(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd(title, details);
    if (title.trim()) {
      setTitle("");
      setDetails("");
    }
  }

  return (
    <section
      aria-label={column.name}
      className="flex h-full min-w-[220px] flex-col rounded-2xl bg-white shadow-[0_16px_40px_rgba(3,33,71,0.06)] ring-1 ring-slate-200/80"
    >
      <header className="px-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <input
              aria-label="Column name"
              value={draft}
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                if (skipBlur.current) {
                  skipBlur.current = false;
                  return;
                }
                commitName(draft);
              }}
              onKeyDown={onNameKeyDown}
              className="w-full rounded-md border border-primary/40 bg-white px-2 py-1 text-base font-semibold text-primary outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(column.name);
                setEditing(true);
              }}
              className="truncate text-left text-base font-semibold text-primary"
            >
              {column.name}
            </button>
          )}
          <span className="text-xs font-medium text-label">{column.cards.length}</span>
        </div>
        <div className="mt-3 h-0.5 rounded-full bg-accent" />
      </header>
      {dragging ? (
        <SortableCardList column={column} onDelete={onDelete}>
          <CardForm title={title} details={details} setTitle={setTitle} setDetails={setDetails} onSubmit={onSubmit} />
        </SortableCardList>
      ) : (
        <>
          <div className="flex min-h-32 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
            {column.cards.map((card) => (
              <CardShell key={card.id} card={card} onDelete={onDelete} />
            ))}
          </div>
          <CardForm title={title} details={details} setTitle={setTitle} setDetails={setDetails} onSubmit={onSubmit} />
        </>
      )}
    </section>
  );
}

function CardForm({
  title,
  details,
  setTitle,
  setDetails,
  onSubmit,
}: {
  title: string;
  details: string;
  setTitle: (value: string) => void;
  setDetails: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="flex flex-col gap-2 border-t border-slate-100 px-3 py-3" onSubmit={onSubmit}>
      <label className="text-xs font-medium text-label">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-navy outline-none focus:border-primary"
        />
      </label>
      <label className="text-xs font-medium text-label">
        Details
        <textarea
          value={details}
          rows={2}
          onChange={(event) => setDetails(event.target.value)}
          className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-navy outline-none focus:border-primary"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Add card
      </button>
    </form>
  );
}

function SortableCardList({
  column,
  onDelete,
  children,
}: {
  column: Column;
  onDelete: (cardId: string) => void;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-0 flex-1 flex-col ${isOver ? "bg-primary/5" : ""}`}
    >
      <SortableContext
        id={column.id}
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-32 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
      {children}
    </div>
  );
}
