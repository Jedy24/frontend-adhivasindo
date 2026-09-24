export type TaskLabel = 'Feature' | 'Bug' | 'Issue' | 'Undefined';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ColumnId = 'todo' | 'doing' | 'review' | 'done' | 'rework';

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

export const EMPTY_FILTER: BoardFilter = {
  search: '',
  assigneeIds: [],
  labels: [],
  due: 'all',
};
