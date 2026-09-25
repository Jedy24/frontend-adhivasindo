export type TaskLabel = 'Feature' | 'Bug' | 'Issue' | 'Undefined';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
/** ID column: 5 bawaan ('todo'|'doing'|'review'|'done'|'rework') + custom 'col-xxx' dari Add new List. */
export type ColumnId = string;

export type DueFilter = 'all' | 'overdue' | 'today' | 'week' | 'nodate';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  mime: string;
}

export interface Task {
  id: string;
  columnId: ColumnId;
  order: number;
  title: string;
  description: string;
  assigneeIds: string[];
  /** ISO date 'YYYY-MM-DD' */
  dueDate: string | null;
  label: TaskLabel;
  priority?: Priority;
  coverImage?: string | null;
  checklist: Subtask[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: ColumnId;
  title: string;
  order: number;
}

export interface BoardFilter {
  search: string;
  assigneeIds: string[];
  labels: TaskLabel[];
  due: DueFilter;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>;

export interface ChecklistProgress {
  done: number;
  total: number;
  pct: number;
}

export const TASK_LABELS: TaskLabel[] = ['Feature', 'Bug', 'Issue', 'Undefined'];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

/** ID bawaan — hanya column custom (di luar daftar ini) yang bisa rename/delete. */
export const DEFAULT_COLUMN_IDS: readonly string[] = ['todo', 'doing', 'review', 'done', 'rework'];

export const isCustomColumn = (id: string): boolean => !DEFAULT_COLUMN_IDS.includes(id);

export const EMPTY_FILTER: BoardFilter = {
  search: '',
  assigneeIds: [],
  labels: [],
  due: 'all',
};
