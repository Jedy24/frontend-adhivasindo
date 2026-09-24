import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IonButton, IonCheckbox, IonIcon, IonInput, IonItem, IonLabel, IonList } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import type { Subtask } from '@app/core/models/board.model';
import { ProgressBarComponent } from '@app/shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-checklist-editor',
  standalone: true,
  imports: [IonButton, IonCheckbox, IonIcon, IonInput, IonItem, IonLabel, IonList, ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <strong>Check List</strong>
      <span class="count">{{ done() }}/{{ items().length }}</span>
    </div>
    <app-progress-bar [pct]="pct()" />
    <ion-list lines="none" class="list">
      @for (sub of items(); track sub.id) {
        <ion-item>
          <ion-checkbox
            slot="start"
            [checked]="sub.done"
            (ionChange)="toggled.emit(sub.id)"
            [ariaLabel]="sub.title"
          />
          <ion-label [class.done]="sub.done">{{ sub.title }}</ion-label>
          <ion-button
            slot="end"
            fill="clear"
            size="small"
            color="danger"
            (click)="removed.emit(sub.id)"
            [ariaLabel]="'Remove ' + sub.title"
          >
            <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-item>
      }
    </ion-list>
    <div class="add">
      <ion-input
        placeholder="Subtask title"
        [value]="draft()"
        (ionInput)="draft.set($event.detail.value ?? '')"
        (keyup.enter)="submit()"
      />
      <ion-button size="small" fill="clear" (click)="submit()" aria-label="Add subtask">
        <ion-icon name="add-outline" slot="start"></ion-icon>
        Add subtask
      </ion-button>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .count {
        font-size: 12px;
        color: var(--board-muted);
      }
      app-progress-bar {
        display: block;
        margin-bottom: 8px;
      }
      .list {
        padding: 0;
      }
      ion-label.done {
        text-decoration: line-through;
        color: #94a3b8;
      }
      .add {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--board-search-bg);
        border-radius: 8px;
        padding: 2px 4px 2px 12px;
        margin-top: 8px;
      }
      .add ion-input {
        --padding-top: 8px;
        --padding-bottom: 8px;
      }
    `,
  ],
})
export class ChecklistEditorComponent {
  readonly items = input<Subtask[]>([]);
  readonly toggled = output<string>();
  readonly added = output<string>();
  readonly removed = output<string>();

  protected readonly draft = signal('');

  protected readonly done = computed(() => this.items().filter((s) => s.done).length);
  protected readonly pct = computed(() => {
    const total = this.items().length;
    return total === 0 ? 0 : Math.round((this.done() / total) * 100);
  });

  constructor() {
    addIcons({ addOutline, trashOutline });
  }

  submit(): void {
    const title = this.draft().trim();
    if (!title) return;
    this.added.emit(title);
    this.draft.set('');
  }
}
