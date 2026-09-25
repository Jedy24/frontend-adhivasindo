import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { IonAvatar, IonButton, IonIcon, PopoverController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { TASK_LABELS } from '@app/core/models/board.model';
import type { BoardFilter } from '@app/core/models/board.model';

const DUE_OPTIONS: { value: BoardFilter['due']; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'nodate', label: 'No date' },
];

@Component({
  selector: 'app-filter-popover',
  standalone: true,
  imports: [IonAvatar, IonButton, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <p class="group">Assignee</p>
      <div class="rows">
        @for (m of store.members(); track m.id) {
          <button
            class="row"
            [class.on]="store.filter().assigneeIds.includes(m.id)"
            (click)="store.toggleAssignee(m.id)"
          >
            <ion-avatar class="ava"><img [src]="m.avatar" [alt]="m.name" /></ion-avatar>
            <span class="name">{{ m.name }}</span>
            <ion-icon name="checkmark-outline" class="tick"></ion-icon>
          </button>
        }
      </div>

      <p class="group">Label</p>
      <div class="chips">
        @for (label of labels; track label) {
          <button
            class="chip"
            [class.on]="store.filter().labels.includes(label)"
            (click)="store.toggleLabel(label)"
          >
            {{ label }}
          </button>
        }
      </div>

      <p class="group">Due date</p>
      <div class="rows">
        @for (opt of dueOptions; track opt.value) {
          <button
            class="row"
            [class.on]="store.filter().due === opt.value"
            (click)="store.setDue(opt.value)"
          >
            <span class="name">{{ opt.label }}</span>
            <ion-icon name="checkmark-outline" class="tick"></ion-icon>
          </button>
        }
      </div>

      <div class="foot">
        <ion-button size="small" fill="clear" (click)="store.clearFilter()">Clear</ion-button>
        <ion-button size="small" (click)="apply()">Apply</ion-button>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        width: 100%;
        max-width: 100%;
        max-height: 72vh;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 12px;
        box-sizing: border-box;
      }
      .group {
        margin: 12px 4px 6px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--board-muted, #64748b);
      }
      .group:first-child {
        margin-top: 0;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding: 7px 8px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 14px;
        cursor: pointer;
        text-align: left;
      }
      .row:hover {
        background: var(--board-search-bg, #eef2f7);
      }
      .ava {
        width: 26px;
        height: 26px;
        flex: 0 0 auto;
      }
      .name {
        flex: 1;
      }
      .tick {
        font-size: 17px;
        color: var(--ion-color-primary, #2563eb);
        opacity: 0;
        transform: scale(0.6);
        transition:
          opacity 0.15s ease,
          transform 0.15s ease;
      }
      .row.on .tick {
        opacity: 1;
        transform: scale(1);
      }
      .row.on {
        background: var(--board-search-bg, #eef2f7);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 2px;
      }
      .chip {
        padding: 5px 12px;
        border-radius: 999px;
        border: 1.5px solid var(--board-line, #e2e8f0);
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .chip.on {
        border-color: var(--ion-color-primary, #2563eb);
        background: var(--ion-color-primary, #2563eb);
        color: #fff;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        gap: 4px;
        padding-top: 10px;
      }
    `,
  ],
})
export class FilterPopoverComponent {
  protected readonly store = inject(BoardStoreService);
  private readonly popoverCtrl = inject(PopoverController);
  readonly close = output<void>();
  readonly labels = TASK_LABELS;
  readonly dueOptions = DUE_OPTIONS;

  constructor() {
    addIcons({ checkmarkOutline });
  }

  apply(): void {
    this.close.emit();
    void this.popoverCtrl.dismiss();
  }
}
