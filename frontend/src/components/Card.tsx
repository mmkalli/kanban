"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/board";

type CardViewProps = {
  card: Card;
  onDelete: (cardId: string) => void;
};

export function CardShell({ card, onDelete }: CardViewProps) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_28px_rgba(3,33,71,0.06)]">
      <CardContents card={card} onDelete={onDelete} />
    </article>
  );
}

export function SortableCard({ card, onDelete }: CardViewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  return (
    <article
      ref={setNodeRef}
      aria-label={card.title}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      className="cursor-grab rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_28px_rgba(3,33,71,0.06)] active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <CardContents card={card} onDelete={onDelete} />
    </article>
  );
}

function CardContents({ card, onDelete }: CardViewProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-navy">{card.title}</h3>
        <button
          type="button"
          aria-label={`Delete ${card.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(card.id)}
          className="shrink-0 rounded-md px-1.5 text-sm leading-none text-label hover:bg-slate-100 hover:text-navy"
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>
      {card.details ? (
        <p className="mt-1.5 text-sm leading-relaxed text-label">{card.details}</p>
      ) : null}
    </>
  );
}
