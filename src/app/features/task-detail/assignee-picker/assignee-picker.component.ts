import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { IonAvatar, IonChip, IonLabel } from '@ionic/angular';
import { BoardStoreService } from '@app/core/services/board-store.service';

@Component({
  selector: 'app-assignee-picker',
  standalone: true,
  imports: [IonAvatar, IonChip, IonLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pick">
      @for (m of store.members(); track m.id) {
        <ion-chip
          [outline]="!selectedIds().includes(m.id)"
          color="primary"
          (click)="toggled.emit(m.id)"
        >
          <ion-avatar class="ava"><img [src]="m.avatar" [alt]="m.name" /></ion-avatar>
          <ion-label>{{ m.name }}</ion-label>
        </ion-chip>
      }
    </div>
  `,
  styles: [
    `
      .pick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .ava {
        width: 20px;
        height: 20px;
        margin-inline-end: 4px;
      }
    `,
  ],
})
export class AssigneePickerComponent {
  protected readonly store = inject(BoardStoreService);
  readonly selectedIds = input<string[]>([]);
  readonly toggled = output<string>();
}
