import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, ellipsisHorizontal } from 'ionicons/icons';
import type { BoardColumn, ColumnId, Task } from '@app/core/models/board.model';
import { TaskCardComponent } from '@app/features/board/task-card/task-card.component';
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [
    DragDropModule,
    IonButton,
    IonIcon,
    TaskCardComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="col" [attr.aria-label]="column().title">
      <header class="col-head">
        <h2 class="col-title">
          {{ column().title }}
          <span class="count">{{ tasks().length }}</span>
        </h2>
        <span class="col-actions">
          <ion-button
            fill="clear"
            size="small"
            [attr.aria-label]="'Add task to ' + column().title"
            (click)="add.emit(column().id)"
          >
            <ion-icon name="add-outline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small" aria-label="Column options">
            <ion-icon name="ellipsis-horizontal" slot="icon-only"></ion-icon>
          </ion-button>
        </span>
      </header>

      <div
        class="drop"
        cdkDropList
        [id]="dropId()"
        [cdkDropListData]="tasks()"
        [cdkDropListConnectedTo]="connectedTo()"
        (cdkDropListDropped)="dropped.emit($event)"
      >
        @for (task of tasks(); track task.id) {
          <app-task-card cdkDrag [task]="task" (open)="open.emit($event)" />
        } @empty {
          <app-empty-state title="No tasks yet" subtitle="Drag a task here or create a new one." />
        }
      </div>
    </section>
  `,
  styles: [
    `
      .col {
        flex: 0 0 280px;
        width: 280px;
        scroll-snap-align: start;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .col-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 2px 10px;
      }
      .col-title {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--board-ink);
      }
      .count {
        font-size: 11px;
        font-weight: 700;
        background: var(--board-search-bg);
        color: var(--board-muted);
        border-radius: 999px;
        padding: 1px 8px;
      }
      .col-actions {
        display: flex;
        align-items: center;
      }
      .col-actions ion-button {
        --padding-start: 4px;
        --padding-end: 4px;
        --color: var(--board-muted);
        margin: 0;
      }
      .drop {
        display: flex;
        flex-direction: column;
        min-height: 120px;
        border-radius: var(--board-radius);
        padding: 2px;
      }
      .drop.cdk-drop-list-dragging {
        background: rgba(37, 99, 235, 0.06);
      }
    `,
  ],
})
export class BoardColumnComponent {
  readonly column = input.required<BoardColumn>();
  readonly tasks = input.required<Task[]>();
  readonly connectedTo = input<string[]>([]);

  readonly dropped = output<CdkDragDrop<Task[]>>();
  readonly add = output<ColumnId>();
  readonly open = output<string>();

  dropId(): string {
    return `list-${this.column().id}`;
  }

  constructor() {
    addIcons({ addOutline, ellipsisHorizontal });
  }
}
