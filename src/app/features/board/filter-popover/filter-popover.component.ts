import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import {
  IonAvatar,
  IonButton,
  IonCheckbox,
  IonChip,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  PopoverController,
} from '@ionic/angular';
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
  imports: [
    IonAvatar,
    IonButton,
    IonCheckbox,
    IonChip,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRadio,
    IonRadioGroup,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <ion-list>
        <ion-list-header>Assignee</ion-list-header>
        @for (m of store.members(); track m.id) {
          <ion-item lines="none">
            <ion-avatar slot="start" class="ava"><img [src]="m.avatar" [alt]="m.name" /></ion-avatar>
            <ion-label>{{ m.name }}</ion-label>
            <ion-checkbox
              slot="end"
              [checked]="store.filter().assigneeIds.includes(m.id)"
              (ionChange)="store.toggleAssignee(m.id)"
              [ariaLabel]="'Filter ' + m.name"
            />
          </ion-item>
        }
      </ion-list>

      <ion-list>
        <ion-list-header>Label</ion-list-header>
        <div class="chips">
          @for (label of labels; track label) {
            <ion-chip
              [outline]="!store.filter().labels.includes(label)"
              color="primary"
              (click)="store.toggleLabel(label)"
            >
              <ion-label>{{ label }}</ion-label>
            </ion-chip>
          }
        </div>
      </ion-list>

      <ion-list>
        <ion-list-header>Due date</ion-list-header>
        <ion-radio-group
          [value]="store.filter().due"
          (ionChange)="store.setDue($event.detail.value)"
        >
          @for (opt of dueOptions; track opt.value) {
            <ion-item lines="none">
              <ion-label>{{ opt.label }}</ion-label>
              <ion-radio slot="end" [value]="opt.value" [ariaLabel]="opt.label" />
            </ion-item>
          }
        </ion-radio-group>
      </ion-list>

      <div class="foot">
        <ion-button size="small" fill="clear" (click)="store.clearFilter()">Clear</ion-button>
        <ion-button size="small" (click)="apply()">Apply</ion-button>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 8px 4px 12px;
        min-width: 260px;
        max-width: 320px;
      }
      .ava {
        width: 28px;
        height: 28px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 12px 8px;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 4px 12px 0;
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

  apply(): void {
    this.close.emit();
    void this.popoverCtrl.dismiss();
  }
}
