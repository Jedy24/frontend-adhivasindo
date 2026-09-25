import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import {
  AlertController,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowDownOutline,
  textOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { isCustomColumn } from '@app/core/models/board.model';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { ToastService } from '@app/core/services/toast.service';
import { TaskDetailModalComponent } from '@app/features/task-detail/task-detail-modal/task-detail-modal.component';
import {
  PromptModalComponent,
  type PromptResult,
} from '@app/shared/components/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-column-menu',
  standalone: true,
  imports: [IonIcon, IonItem, IonLabel, IonList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-list lines="none" class="menu">
      <ion-item button (click)="addTask()">
        <ion-icon name="add-outline" slot="start"></ion-icon>
        <ion-label>Add task</ion-label>
      </ion-item>
      <ion-item button (click)="sort('due')">
        <ion-icon name="time-outline" slot="start"></ion-icon>
        <ion-label>Sort by due date</ion-label>
      </ion-item>
      <ion-item button (click)="sort('title')">
        <ion-icon name="text-outline" slot="start"></ion-icon>
        <ion-label>Sort by title</ion-label>
      </ion-item>
      @if (custom()) {
        <ion-item button (click)="rename()">
          <ion-icon name="arrow-down-outline" slot="start"></ion-icon>
          <ion-label>Rename list</ion-label>
        </ion-item>
        <ion-item button (click)="remove()">
          <ion-icon name="trash-outline" slot="start" color="danger" class="danger"></ion-icon>
          <ion-label color="danger">Delete list</ion-label>
        </ion-item>
      }
    </ion-list>
  `,
  styles: [
    `
      .menu {
        min-width: 220px;
        padding: 8px;
      }
      .menu ion-item {
        --background: transparent;
        --background-hover: var(--board-search-bg, #eef2f7);
        --background-activated: var(--board-search-bg, #eef2f7);
        --border-radius: 10px;
        --padding-start: 10px;
        --inner-padding-end: 10px;
        --min-height: 42px;
        font-size: 13.5px;
        font-weight: 500;
      }
      .menu ion-icon[slot='start'] {
        font-size: 18px;
        margin-inline-end: 12px;
        color: var(--board-muted, #64748b);
      }
      .menu ion-icon[slot='start'].danger {
        color: var(--ion-color-danger, #dc2626);
      }
    `,
  ],
})
export class ColumnMenuComponent {
  @Input() columnId = 'todo';

  private readonly store = inject(BoardStoreService);
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  private readonly popoverCtrl = inject(PopoverController);
  private readonly toast = inject(ToastService);

  constructor() {
    addIcons({ addOutline, arrowDownOutline, textOutline, timeOutline, trashOutline });
  }

  custom(): boolean {
    return isCustomColumn(this.columnId);
  }

  async addTask(): Promise<void> {
    await this.popoverCtrl.dismiss();
    const modal = await this.modalCtrl.create({
      component: TaskDetailModalComponent,
      componentProps: { taskId: null, columnId: this.columnId },
      cssClass: 'task-detail-modal',
    });
    await modal.present();
  }

  async sort(by: 'due' | 'title'): Promise<void> {
    this.store.sortColumn(this.columnId, by);
    await this.popoverCtrl.dismiss();
    await this.toast.notify(by === 'due' ? 'Column sorted by due date' : 'Column sorted by title', 'primary');
  }

  async rename(): Promise<void> {
    const current = this.store.columns().find((c) => c.id === this.columnId)?.title ?? '';
    const modal = await this.modalCtrl.create({
      component: PromptModalComponent,
      componentProps: {
        title: 'Rename list',
        placeholder: 'List title',
        value: current,
        confirmLabel: 'Save',
      },
      cssClass: 'prompt-modal',
    });
    await this.popoverCtrl.dismiss();
    await modal.present();
    const { data, role } = await modal.onWillDismiss<PromptResult>();
    if (role !== 'confirm' || !data?.value.trim()) return;
    this.store.renameColumn(this.columnId, data.value);
    await this.toast.notify('List renamed', 'primary');
  }

  async remove(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete list?',
      message: 'Tasks inside will be moved to the first list.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            this.store.deleteColumn(this.columnId);
            await this.toast.notify('List deleted', 'danger');
          },
        },
      ],
    });
    await this.popoverCtrl.dismiss();
    await alert.present();
  }
}
