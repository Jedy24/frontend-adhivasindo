import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { BoardStoreService } from '@app/core/services/board-store.service';

@Component({
  selector: 'app-assignee-picker',
  standalone: true,
  imports: [IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pick-list" role="group" aria-label="Assignee">
      @for (m of store.members(); track m.id) {
        <button
          type="button"
          class="pick"
          [class.on]="selectedIds().includes(m.id)"
          [attr.aria-pressed]="selectedIds().includes(m.id)"
          (click)="toggled.emit(m.id)"
        >
          <img class="ava" [src]="m.avatar" [alt]="m.name" loading="lazy" />
          <span class="name">{{ m.name }}</span>
          <ion-icon name="checkmark-outline" class="tick"></ion-icon>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .pick-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .pick {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 4px 12px 4px 4px;
        border-radius: 999px;
        border: 1.5px solid var(--board-line, #cbd5e1);
        background: transparent;
        color: var(--board-ink, #1f2937);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease,
          box-shadow 0.15s ease;
      }
      .pick:hover {
        border-color: var(--ion-color-primary, #2563eb);
      }
      .ava {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        object-fit: cover;
        flex: 0 0 auto;
      }
      .tick {
        font-size: 15px;
        font-weight: 700;
        opacity: 0;
        width: 0;
        margin-left: -7px;
        transition:
          opacity 0.15s ease,
          width 0.15s ease,
          margin 0.15s ease;
      }
      .pick.on {
        background: var(--ion-color-primary, #2563eb);
        border-color: var(--ion-color-primary, #2563eb);
        color: #fff;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
      }
      .pick.on .tick {
        opacity: 1;
        width: 15px;
        margin-left: 0;
      }
    `,
  ],
})
export class AssigneePickerComponent {
  protected readonly store = inject(BoardStoreService);
  readonly selectedIds = input<string[]>([]);
  readonly toggled = output<string>();

  constructor() {
    addIcons({ checkmarkOutline });
  }
}
