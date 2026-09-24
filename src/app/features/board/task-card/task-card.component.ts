import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { IonCard, IonCardContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { attachOutline, calendarOutline, checkboxOutline } from 'ionicons/icons';
import type { Member, Task } from '@app/core/models/board.model';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { DueDateService } from '@app/core/services/due-date.service';
import { AvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack.component';
import { LabelChipComponent } from '@app/shared/components/label-chip/label-chip.component';
import { ProgressBarComponent } from '@app/shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [IonCard, IonCardContent, IonIcon, AvatarStackComponent, LabelChipComponent, ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="task" button (click)="open.emit(task().id)">
      @if (task().coverImage) {
        <img class="cover" [src]="task().coverImage" [alt]="task().title" loading="lazy" />
      }
      <ion-card-content>
        <app-label-chip [label]="task().label" />
        <p class="title clamp-2">{{ task().title }}</p>
        @if (progress().total > 0) {
          <app-progress-bar [pct]="progress().pct" />
        }
        <div class="meta">
          <span class="meta-left">
            @if (task().dueDate) {
              <span class="pill" [attr.data-status]="dueStatus()">
                <ion-icon name="calendar-outline"></ion-icon>
                {{ dueText() }}
              </span>
            }
            @if (progress().total > 0) {
              <span class="pill">
                <ion-icon name="checkbox-outline"></ion-icon>
                {{ progress().done }}/{{ progress().total }}
              </span>
            }
            @if (task().attachments.length > 0) {
              <span class="pill">
                <ion-icon name="attach-outline"></ion-icon>
                {{ task().attachments.length }}
              </span>
            }
          </span>
          <app-avatar-stack [members]="assignees()" />
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .task {
        margin: 0 0 12px;
        background: var(--board-card-bg);
        border-radius: var(--board-radius);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
        cursor: pointer;
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;
      }
      .task:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
      }
      .cover {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 8px 8px 0 0;
        display: block;
      }
      ion-card-content {
        padding: 10px 12px;
      }
      .title {
        margin: 8px 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--board-ink);
        font-weight: 500;
      }
      app-progress-bar {
        display: block;
        margin: 8px 0 4px;
      }
      .meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
      }
      .meta-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: var(--board-muted);
      }
      .pill ion-icon {
        font-size: 13px;
      }
      .pill[data-status='overdue'] {
        color: #dc2626;
        font-weight: 700;
      }
      .pill[data-status='today'] {
        color: #2563eb;
        font-weight: 700;
      }
    `,
  ],
})
export class TaskCardComponent {
  private readonly store = inject(BoardStoreService);
  private readonly dueDate = inject(DueDateService);

  readonly task = input.required<Task>();
  readonly open = output<string>();

  readonly assignees = computed<Member[]>(() =>
    this.task()
      .assigneeIds.map((id) => this.store.memberById(id))
      .filter((m): m is Member => !!m),
  );

  readonly progress = computed(() => this.store.progress(this.task().id));

  readonly dueText = computed(() => this.dueDate.formatShort(this.task().dueDate));

  readonly dueStatus = computed(() => this.dueDate.status(this.task().dueDate, this.task().columnId));

  constructor() {
    addIcons({ attachOutline, calendarOutline, checkboxOutline });
  }
}
