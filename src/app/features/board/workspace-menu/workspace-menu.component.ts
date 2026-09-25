import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline, refreshOutline } from 'ionicons/icons';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { ToastService } from '@app/core/services/toast.service';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [IonIcon, IonItem, IonLabel, IonList, IonListHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-list lines="none" class="menu">
      <ion-list-header>Boards</ion-list-header>
      <ion-item>
        <ion-label>
          <strong>Adhivasindo</strong>
          <p>{{ total() }} tasks across {{ columns() }} lists</p>
        </ion-label>
        <ion-icon name="checkmark-outline" slot="end" color="primary"></ion-icon>
      </ion-item>
      <ion-item button (click)="reset()">
        <ion-icon name="refresh-outline" slot="start"></ion-icon>
        <ion-label>Reset to seed data</ion-label>
      </ion-item>
    </ion-list>
  `,
  styles: [
    `
      .menu {
        min-width: 250px;
        padding: 6px;
      }
      ion-item {
        --border-radius: 8px;
        font-size: 14px;
      }
      p {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--board-muted, #64748b);
      }
    `,
  ],
})
export class WorkspaceMenuComponent {
  private readonly store = inject(BoardStoreService);
  private readonly popoverCtrl = inject(PopoverController);
  private readonly toast = inject(ToastService);

  protected readonly total = computed(() => this.store.tasks().length);
  protected readonly columns = computed(() => this.store.columns().length);

  constructor() {
    addIcons({ checkmarkOutline, refreshOutline });
  }

  async reset(): Promise<void> {
    this.store.resetToSeed();
    await this.popoverCtrl.dismiss();
    await this.toast.notify('Board reset to seed data', 'primary');
  }
}
