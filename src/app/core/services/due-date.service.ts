import { Injectable } from '@angular/core';
import { format, isToday, isBefore, parseISO, startOfToday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { ColumnId } from '@app/core/models/board.model';

export type DueStatus = 'overdue' | 'today' | 'upcoming' | 'none';

@Injectable({ providedIn: 'root' })
export class DueDateService {
  formatShort(iso: string | null): string {
    if (!iso) return 'No date';
    try {
      return format(parseISO(iso), 'd MMM', { locale: localeId });
    } catch {
      return iso;
    }
  }

  status(iso: string | null, columnId: ColumnId): DueStatus {
    if (!iso || columnId === 'done') return 'none';
    try {
      const date = parseISO(iso);
      if (isToday(date)) return 'today';
      if (isBefore(date, startOfToday())) return 'overdue';
      return 'upcoming';
    } catch {
      return 'none';
    }
  }
}
