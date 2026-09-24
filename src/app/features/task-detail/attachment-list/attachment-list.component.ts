import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { documentOutline, trashOutline } from 'ionicons/icons';
import type { Attachment } from '@app/core/models/board.model';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [IonButton, IonIcon, IonItem, IonLabel, IonList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length === 0) {
      <p class="hint">No attachments yet. Add a dummy file below.</p>
    } @else {
      <ion-list lines="none" class="list">
        @for (att of items(); track att.id) {
          <ion-item>
            <ion-icon name="document-outline" slot="start" aria-hidden="true"></ion-icon>
            <ion-label>
              <p class="name">{{ att.name }}</p>
              <p class="size">{{ att.size }}</p>
            </ion-label>
            <ion-button
              slot="end"
              fill="clear"
              size="small"
              color="danger"
              (click)="removed.emit(att.id)"
              [ariaLabel]="'Remove ' + att.name"
            >
              <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>
        }
      </ion-list>
    }
  `,
  styles: [
    `
      .hint {
        font-size: 12.5px;
        color: #94a3b8;
        margin: 0 0 8px;
      }
      .list {
        padding: 0;
      }
      .name {
        margin: 0;
        font-size: 13px;
        color: var(--board-ink);
      }
      .size {
        margin: 0;
        font-size: 11px;
        color: #94a3b8;
      }
    `,
  ],
})
export class AttachmentListComponent {
  readonly items = input<Attachment[]>([]);
  readonly removed = output<string>();

  constructor() {
    addIcons({ documentOutline, trashOutline });
  }
}
