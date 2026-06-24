"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, RotateCcw, ChevronRight } from "lucide-react";
import type { Paper, Section, Unit } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSyllabusPaper } from "@/lib/hooks/useSyllabusPaper";
import { useMounted } from "@/lib/hooks/useMounted";

type Sensors = ReturnType<typeof useSensors>;

const handleClass =
  "grid shrink-0 cursor-grab touch-none place-items-center rounded text-muted-foreground/70 hover:text-foreground active:cursor-grabbing";
const iconBtnClass =
  "grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function unitLabel(unit: Unit) {
  return unit.number !== "—" ? `${unit.number}. ${unit.title}` : unit.title;
}

/** A single ordered "topic" row — numbered, draggable, styled as a card. */
function SortableTopic({
  id,
  index,
  text,
}: {
  id: string;
  index: number;
  text: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40",
        isDragging && "z-10 opacity-80 shadow-lg ring-1 ring-ring",
      )}
    >
      <button
        type="button"
        className={cn(handleClass, "h-6 w-5 opacity-50 group-hover:opacity-100")}
        aria-label="Drag to reorder topic"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-accent text-xs font-semibold tabular-nums text-accent-foreground">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug">{text}</span>
    </li>
  );
}

/** A section's subtopics (= "topics"), always drag-sortable within their unit. */
function UnitTopics({
  section,
  unit,
  sensors,
  onReorder,
}: {
  section: Section;
  unit: Unit;
  sensors: Sensors;
  onReorder: (unitId: string, oldIndex: number, newIndex: number) => void;
}) {
  const label =
    section.units.length > 1 ? (
      <p className="px-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {unitLabel(unit)}
      </p>
    ) : null;

  if (!unit.subtopics.length) {
    return (
      <div className="space-y-1.5">
        {label}
        <p className="px-1 text-sm text-muted-foreground">No topics.</p>
      </div>
    );
  }

  const items = unit.subtopics.map((_, i) => `${unit.id}-st-${i}`);
  return (
    <div className="space-y-2">
      {label}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={(e: DragEndEvent) => {
          const { active, over } = e;
          if (!over || active.id === over.id) return;
          const oldI = items.indexOf(String(active.id));
          const newI = items.indexOf(String(over.id));
          if (oldI < 0 || newI < 0) return;
          onReorder(unit.id, oldI, newI);
        }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {unit.subtopics.map((t, i) => (
              <SortableTopic key={items[i]} id={items[i]} index={i} text={t} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SectionCard({
  section,
  expanded,
  onToggle,
  sensors,
  editHref,
  onDelete,
  onReorderTopics,
}: {
  section: Section;
  expanded: boolean;
  onToggle: () => void;
  sensors: Sensors;
  editHref: string;
  onDelete: () => void;
  onReorderTopics: (unitId: string, oldIndex: number, newIndex: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        isDragging && "z-10 opacity-80 shadow-lg ring-1 ring-ring",
      )}
    >
      <div className="flex items-center gap-1.5 p-2.5">
        {/* Section drag handle (siblings below each have their own click target). */}
        <button
          type="button"
          className={cn(handleClass, "h-8 w-6")}
          aria-label="Drag to reorder section"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Whole title region toggles collapse. */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-muted/50"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90",
            )}
          />
          <span className="min-w-0">
            <span className="block truncate font-semibold tracking-tight">
              {section.label}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{section.marks} marks</Badge>
              {section.pattern ? (
                <span className="text-xs text-muted-foreground">{section.pattern}</span>
              ) : null}
            </span>
          </span>
        </button>

        <Link href={editHref} className={iconBtnClass} aria-label="Edit on the edit page">
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className={iconBtnClass}
          aria-label="Delete section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded ? (
        <div className="space-y-3 border-t border-border p-3">
          {section.units.length ? (
            section.units.map((u) => (
              <UnitTopics
                key={u.id}
                section={section}
                unit={u}
                sensors={sensors}
                onReorder={onReorderTopics}
              />
            ))
          ) : (
            <p className="px-1 text-sm text-muted-foreground">No units.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Manage-the-paper overview. Sections are collapsible (click the title) and
 * always drag-reorderable by their handle; expanding a section reveals its
 * topics as numbered rows that drag-reorder within their unit. Content text is
 * edited on the edit page; all reorders/deletes persist via the override store.
 */
export function PaperOverview({
  seed,
  created = false,
}: {
  seed: Paper;
  /** True when this paper was created in the admin (no seed to reset to). */
  created?: boolean;
}) {
  const router = useRouter();
  const { paper, update, reset, isOverridden } = useSyllabusPaper(seed);
  const mounted = useMounted();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const editHref = `/admin/syllabus/${seed.id}/edit`;
  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  function onSectionDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = paper.sections.findIndex((s) => s.id === active.id);
    const newI = paper.sections.findIndex((s) => s.id === over.id);
    if (oldI < 0 || newI < 0) return;
    update({ ...paper, sections: arrayMove(paper.sections, oldI, newI) });
  }

  function reorderTopics(
    sectionId: string,
    unitId: string,
    oldIndex: number,
    newIndex: number,
  ) {
    update({
      ...paper,
      sections: paper.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              units: s.units.map((u) =>
                u.id !== unitId
                  ? u
                  : { ...u, subtopics: arrayMove(u.subtopics, oldIndex, newIndex) },
              ),
            },
      ),
    });
  }

  function deleteSection(section: Section) {
    if (!window.confirm(`Delete "${section.label}" and its units?`)) return;
    update({ ...paper, sections: paper.sections.filter((s) => s.id !== section.id) });
  }

  // For a seed paper, reset just drops the override (falls back to the seed).
  // For a created paper there is no seed, so reset deletes it — confirm + leave.
  function handleResetOrDelete() {
    if (created) {
      if (!window.confirm(`Delete "${paper.title}"? This can’t be undone.`)) return;
      reset();
      router.push("/admin/syllabus");
      return;
    }
    reset();
  }

  if (!mounted) {
    return (
      <div className="space-y-3">
        {seed.sections.map((s) => (
          <Skeleton key={s.id} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Drag the handles to reorder sections and topics. Click a title to expand.
        </p>
        {created ? (
          <Button variant="outline" size="sm" onClick={handleResetOrDelete}>
            <Trash2 className="h-4 w-4" />
            Delete paper
          </Button>
        ) : isOverridden ? (
          <Button variant="outline" size="sm" onClick={handleResetOrDelete}>
            <RotateCcw className="h-4 w-4" />
            Reset to default
          </Button>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={onSectionDragEnd}
      >
        <SortableContext
          items={paper.sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {paper.sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                expanded={!!expanded[section.id]}
                onToggle={() => toggleExpand(section.id)}
                sensors={sensors}
                editHref={editHref}
                onDelete={() => deleteSection(section)}
                onReorderTopics={(unitId, oldI, newI) =>
                  reorderTopics(section.id, unitId, oldI, newI)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
