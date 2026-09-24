import { Injectable, computed, effect, signal } from '@angular/core';
import { format, isToday, isWithinInterval, addDays, parseISO, isBefore, startOfToday } from 'date-fns';
import type {
  Attachment,
  BoardColumn,
  BoardFilter,
  ChecklistProgress,
  ColumnId,
  CreateTaskInput,
  Member,
  Task,
} from '@app/core/models/board.model';
import { EMPTY_FILTER } from '@app/core/models/board.model';
import { MEMBERS } from '@app/core/data/members';
import { SEED_COLUMNS, buildSeedTasks } from '@app/core/data/seed';

const STORAGE_KEY = 'adhivasindo-board-v2';

interface PersistedBoard {
  tasks: Task[];
  columns: BoardColumn[];
}

function safeParse(raw: string | null): PersistedBoard | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as PersistedBoard;
    if (!Array.isArray(data.tasks) || !Array.isArray(data.columns)) return null;
    return data;
  } catch {
    return null;
  }
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

interface DateParts {
  day: number;
  month: number;
  year: string;
  monthShort: string;
  monthLong: string;
}

/** Pecah ISO date menjadi bagian-bagian diskrit agar '20' tidak cocok ke tahun '2026'. */
function dateParts(isoDate: string | null): DateParts | null {
  if (!isoDate) return null;
  try {
    const d = parseISO(isoDate);
    return {
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: String(d.getFullYear()),
      monthShort: format(d, 'MMM').toLowerCase(),
      monthLong: format(d, 'MMMM').toLowerCase(),
    };
  } catch {
    return null;
  }
}

/**
 * Satu token query cocok ke tanggal bila:
 * - numerik murni -> sama persis dengan tanggal, nomor bulan, atau tahun ('20' = tgl 20, bukan '2026')
 * - alfabet -> awalan nama bulan ('sep', 'sept', 'september')
 * - campuran ('28/09', '2026-09-28') -> semua sub-bagiannya cocok
 */
function tokenMatchesDate(token: string, parts: DateParts): boolean {
  if (/^\d+$/.test(token)) {
    const n = Number(token);
    return n === parts.day || n === parts.month || token === parts.year;
  }
  if (/^[a-z]+$/.test(token) && token.length >= 2) {
    return parts.monthShort.startsWith(token) || parts.monthLong.startsWith(token);
  }
  const subs = token.split(/[/\-.]/).filter(Boolean);
  if (subs.length > 1) {
    return subs.every((s) => tokenMatchesDate(s, parts));
  }
  return false;
}

const matchesDue = (task: Task, due: BoardFilter['due']): boolean => {
  if (due === 'all') return true;
  if (due === 'nodate') return task.dueDate === null;
  if (!task.dueDate) return false;
  let date: Date;
  try {
    date = parseISO(task.dueDate);
  } catch {
    return false;
  }
  const today = startOfToday();
  switch (due) {
    case 'overdue':
      return isBefore(date, today);
    case 'today':
      return isToday(date);
    case 'week':
      return isWithinInterval(date, { start: today, end: addDays(today, 7) });
    default:
      return true;
  }
};

@Injectable({ providedIn: 'root' })
export class BoardStoreService {
  readonly tasks = signal<Task[]>([]);
  readonly columns = signal<BoardColumn[]>([]);
  readonly members = signal<Member[]>(MEMBERS);
  readonly filter = signal<BoardFilter>({ ...EMPTY_FILTER });
  readonly hydrated = signal(false);

  readonly filteredTasks = computed<Task[]>(() => {
    const f = this.filter();
    const tokens = f.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const names = new Map(this.members().map((m) => [m.id, m.name.toLowerCase()]));
    return this.tasks().filter((t) => {
      if (
        !(
          (f.assigneeIds.length === 0 || t.assigneeIds.some((id) => f.assigneeIds.includes(id))) &&
          (f.labels.length === 0 || f.labels.includes(t.label)) &&
          matchesDue(t, f.due)
        )
      ) {
        return false;
      }
      if (tokens.length === 0) return true;
      const haystack = [
        t.title,
        t.description,
        t.label,
        t.priority ?? '',
        ...t.assigneeIds.map((id) => names.get(id) ?? ''),
      ]
        .join(' ')
        .toLowerCase();
      const parts = dateParts(t.dueDate);
      return tokens.every((tok) => haystack.includes(tok) || (parts !== null && tokenMatchesDate(tok, parts)));
    });
  });

  readonly tasksByColumn = computed<Record<ColumnId, Task[]>>(() => {
    const grouped: Record<ColumnId, Task[]> = {
      todo: [],
      doing: [],
      review: [],
      done: [],
      rework: [],
    };
    for (const task of this.filteredTasks()) {
      grouped[task.columnId].push(task);
    }
    for (const key of Object.keys(grouped) as ColumnId[]) {
      grouped[key].sort((a, b) => a.order - b.order);
    }
    return grouped;
  });

  readonly counts = computed<Record<ColumnId, number>>(() => {
    const byCol = this.tasksByColumn();
    return {
      todo: byCol.todo.length,
      doing: byCol.doing.length,
      review: byCol.review.length,
      done: byCol.done.length,
      rework: byCol.rework.length,
    };
  });

  readonly isFiltering = computed<boolean>(() => {
    const f = this.filter();
    return (
      f.search.trim() !== '' || f.assigneeIds.length > 0 || f.labels.length > 0 || f.due !== 'all'
    );
  });

  constructor() {
    effect(() => {
      if (!this.hydrated()) return;
      try {
        const payload: PersistedBoard = { tasks: this.tasks(), columns: this.columns() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Kuota penuh atau storage tidak tersedia — state in-memory tetap jalan.
      }
    });
  }

  hydrate(): void {
    if (this.hydrated()) return;
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      this.tasks.set(saved.tasks);
      this.columns.set(saved.columns);
    } else {
      this.tasks.set(buildSeedTasks());
      this.columns.set(SEED_COLUMNS);
    }
    this.hydrated.set(true);
  }

  resetToSeed(): void {
    this.tasks.set(buildSeedTasks());
    this.columns.set(SEED_COLUMNS);
    this.filter.set({ ...EMPTY_FILTER });
  }

  exportJSON(): string {
    return JSON.stringify({ tasks: this.tasks(), columns: this.columns() }, null, 2);
  }

  importJSON(json: string): void {
    const data = JSON.parse(json) as PersistedBoard;
    if (!Array.isArray(data.tasks) || !Array.isArray(data.columns)) {
      throw new Error('Format file tidak valid.');
    }
    this.tasks.set(data.tasks);
    this.columns.set(data.columns);
    this.normalizeAll();
  }

  getTask(id: string): Task | undefined {
    return this.tasks().find((t) => t.id === id);
  }

  memberById(id: string): Member | undefined {
    return this.members().find((m) => m.id === id);
  }

  progress(taskId: string): ChecklistProgress {
    const task = this.getTask(taskId);
    const total = task?.checklist.length ?? 0;
    const done = task?.checklist.filter((s) => s.done).length ?? 0;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }

  createTask(input: CreateTaskInput): Task {
    const stamp = new Date().toISOString();
    const siblings = this.tasks().filter((t) => t.columnId === input.columnId);
    const maxOrder = siblings.reduce((m, t) => Math.max(m, t.order), -1);
    const task: Task = { ...input, id: newId('task'), order: maxOrder + 1, createdAt: stamp, updatedAt: stamp };
    this.tasks.update((list) => [...list, task]);
    return task;
  }

  updateTask(id: string, patch: Partial<Task>): void {
    const stamp = new Date().toISOString();
    this.tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch, id: t.id, updatedAt: stamp } : t)),
    );
  }

  deleteTask(id: string): void {
    const target = this.getTask(id);
    this.tasks.update((list) => list.filter((t) => t.id !== id));
    if (target) this.normalizeColumn(target.columnId);
  }

  moveTask(taskId: string, toColumn: ColumnId, toIndex: number): void {
    const task = this.getTask(taskId);
    if (!task) return;
    const fromColumn = task.columnId;
    const stamp = new Date().toISOString();

    const ordered = (col: ColumnId): Task[] =>
      this.tasks()
        .filter((t) => t.columnId === col && t.id !== taskId)
        .sort((a, b) => a.order - b.order);

    if (fromColumn === toColumn) {
      const rest = ordered(fromColumn);
      const clamped = Math.max(0, Math.min(toIndex, rest.length));
      rest.splice(clamped, 0, { ...task, updatedAt: stamp });
      const reindexed = rest.map((t, i) => ({ ...t, order: i }));
      this.tasks.update((list) => list.map((t) => reindexed.find((r) => r.id === t.id) ?? t));
      return;
    }

    const dest = ordered(toColumn);
    const clamped = Math.max(0, Math.min(toIndex, dest.length));
    dest.splice(clamped, 0, { ...task, columnId: toColumn, updatedAt: stamp });
    const reindexedDest = dest.map((t, i) => ({ ...t, order: i }));
    const source = this.tasks()
      .filter((t) => t.columnId === fromColumn && t.id !== taskId)
      .sort((a, b) => a.order - b.order)
      .map((t, i) => ({ ...t, order: i }));
    const merged = new Map([...reindexedDest, ...source].map((t) => [t.id, t]));
    this.tasks.update((list) => list.map((t) => merged.get(t.id) ?? t));
  }

  toggleSubtask(taskId: string, subtaskId: string): void {
    this.updateChecklist(taskId, (list) =>
      list.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
    );
  }

  addSubtask(taskId: string, title: string): void {
    const name = title.trim();
    if (!name) return;
    this.updateChecklist(taskId, (list) => [...list, { id: newId('sub'), title: name, done: false }]);
  }

  removeSubtask(taskId: string, subtaskId: string): void {
    this.updateChecklist(taskId, (list) => list.filter((s) => s.id !== subtaskId));
  }

  addAttachment(taskId: string, att: Attachment): void {
    const stamp = new Date().toISOString();
    this.tasks.update((list) =>
      list.map((t) =>
        t.id === taskId ? { ...t, attachments: [...t.attachments, att], updatedAt: stamp } : t,
      ),
    );
  }

  removeAttachment(taskId: string, attachmentId: string): void {
    const stamp = new Date().toISOString();
    this.tasks.update((list) =>
      list.map((t) =>
        t.id === taskId
          ? { ...t, attachments: t.attachments.filter((a) => a.id !== attachmentId), updatedAt: stamp }
          : t,
      ),
    );
  }

  setCover(taskId: string, url: string | null): void {
    this.updateTask(taskId, { coverImage: url });
  }

  setSearch(value: string): void {
    this.filter.update((f) => ({ ...f, search: value }));
  }

  toggleAssignee(id: string): void {
    this.filter.update((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id)
        ? f.assigneeIds.filter((x) => x !== id)
        : [...f.assigneeIds, id],
    }));
  }

  toggleLabel(label: Task['label']): void {
    this.filter.update((f) => ({
      ...f,
      labels: f.labels.includes(label) ? f.labels.filter((x) => x !== label) : [...f.labels, label],
    }));
  }

  setDue(due: BoardFilter['due']): void {
    this.filter.update((f) => ({ ...f, due }));
  }

  clearFilter(): void {
    this.filter.set({ ...EMPTY_FILTER });
  }

  private updateChecklist(taskId: string, fn: (list: Task['checklist']) => Task['checklist']): void {
    const stamp = new Date().toISOString();
    this.tasks.update((list) =>
      list.map((t) => (t.id === taskId ? { ...t, checklist: fn(t.checklist), updatedAt: stamp } : t)),
    );
  }

  private normalizeColumn(columnId: ColumnId): void {
    const ordered = this.tasks()
      .filter((t) => t.columnId === columnId)
      .sort((a, b) => a.order - b.order)
      .map((t, i) => ({ ...t, order: i }));
    const merged = new Map(ordered.map((t) => [t.id, t]));
    this.tasks.update((list) => list.map((t) => merged.get(t.id) ?? t));
  }

  private normalizeAll(): void {
    for (const col of this.columns()) this.normalizeColumn(col.id);
  }
}
