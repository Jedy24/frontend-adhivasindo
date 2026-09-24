import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format, parseISO } from 'date-fns';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkDoneOutline,
  closeOutline,
  cloudUploadOutline,
  imageOutline,
  trashOutline,
} from 'ionicons/icons';
import type { Attachment, ColumnId, Priority, Task, TaskLabel } from '@app/core/models/board.model';
import { PRIORITIES, TASK_LABELS } from '@app/core/models/board.model';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { ToastService } from '@app/core/services/toast.service';
import { ChecklistEditorComponent } from '@app/features/task-detail/checklist-editor/checklist-editor.component';
import { AttachmentListComponent } from '@app/features/task-detail/attachment-list/attachment-list.component';
import { AssigneePickerComponent } from '@app/features/task-detail/assignee-picker/assignee-picker.component';

function randomCover(): string {
  return `https://picsum.photos/seed/adhivas-${Math.floor(Math.random() * 100000)}/640/320`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
    ChecklistEditorComponent,
    AttachmentListComponent,
    AssigneePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (taskId) {
            <ion-button size="small" (click)="markComplete()">
              <ion-icon name="checkmark-done-outline" slot="start"></ion-icon>
              Mark Complete
            </ion-button>
          }
        </ion-buttons>
        <ion-title>{{ taskId ? 'Task Details' : 'New Task' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" aria-label="Close">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="grid">
        <!-- Kolom kiri: form utama -->
        <div class="left">
          <button class="cover-cta" (click)="pickCover()">
            @if (coverImage) {
              <img [src]="coverImage" alt="Cover task" />
            } @else {
              <span class="cover-empty">
                <ion-icon name="image-outline"></ion-icon>
                Add Cover Image
              </span>
            }
          </button>
          @if (coverImage) {
            <ion-button size="small" fill="clear" color="danger" (click)="coverImage = null">
              Remove cover
            </ion-button>
          }

          <ion-item lines="none" class="field">
            <ion-input
              label="Task title"
              labelPlacement="stacked"
              placeholder="Write a task title"
              [(ngModel)]="title"
            />
          </ion-item>

          <div class="row2">
            <div class="field">
              <p class="lbl">Assignee</p>
              <app-assignee-picker [selectedIds]="assigneeIds" (toggled)="toggleAssignee($event)" />
            </div>
            <ion-item lines="none" class="field">
              <ion-label position="stacked">Due Date</ion-label>
              <input type="date" class="native-date" [(ngModel)]="dueDate" />
            </ion-item>
          </div>

          <div class="row2">
            <ion-item lines="none" class="field">
              <ion-select label="Board" labelPlacement="stacked" [value]="'adhivasindo'" [disabled]="true">
                <ion-select-option value="adhivasindo">Adhivasindo</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="none" class="field">
              <ion-select label="Column" labelPlacement="stacked" [(ngModel)]="colId">
                @for (c of store.columns(); track c.id) {
                  <ion-select-option [value]="c.id">{{ c.title }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
          </div>

          <div class="row2">
            <ion-item lines="none" class="field">
              <ion-select label="Label" labelPlacement="stacked" [(ngModel)]="label">
                @for (l of labels; track l) {
                  <ion-select-option [value]="l">{{ l }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
            <ion-item lines="none" class="field">
              <ion-select label="Priority" labelPlacement="stacked" [(ngModel)]="priority">
                <ion-select-option [value]="undefined">-</ion-select-option>
                @for (p of priorities; track p) {
                  <ion-select-option [value]="p">{{ p }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
          </div>

          <ion-item lines="none" class="field">
            <ion-textarea
              label="Description"
              labelPlacement="stacked"
              placeholder="Write a task description"
              [autoGrow]="true"
              [(ngModel)]="description"
            />
          </ion-item>
        </div>

        <!-- Kolom kanan: attachments, checklist, activity -->
        <div class="right">
          <section>
            <strong>Attachments</strong>
            <label class="dropzone">
              <ion-icon name="cloud-upload-outline"></ion-icon>
              <span>Drag & Drop files here or <em>browse from device</em></span>
              <input type="file" hidden multiple (change)="onFiles($event)" />
            </label>
            <app-attachment-list [items]="attachmentItems()" (removed)="removeAttachment($event)" />
          </section>

          <section>
            <app-checklist-editor
              [items]="checklistItems()"
              (toggled)="toggleSubtask($event)"
              (added)="addSubtask($event)"
              (removed)="removeSubtask($event)"
            />
          </section>

          @if (editing()) {
            <section class="activity">
              <strong>Activity</strong>
              <p>Created: {{ fmtDate(editing()?.createdAt) }}</p>
              <p>Updated: {{ fmtDate(editing()?.updatedAt) }}</p>
            </section>
          }
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (taskId) {
            <ion-button color="danger" (click)="confirmDelete()">
              <ion-icon name="trash-outline" slot="start"></ion-icon>
              Delete
            </ion-button>
          }
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="dismiss()">Discard</ion-button>
          <ion-button (click)="save()" [disabled]="!title.trim()">Save</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }
      @media (min-width: 768px) {
        .grid {
          grid-template-columns: 1.1fr 1fr;
        }
      }
      .cover-cta {
        width: 100%;
        border: 0;
        border-radius: 12px;
        background: var(--board-search-bg);
        padding: 0;
        overflow: hidden;
        cursor: pointer;
        margin-bottom: 8px;
      }
      .cover-cta img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
      }
      .cover-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 40px 0;
        color: #2563eb;
        font-size: 13px;
      }
      .cover-empty ion-icon {
        font-size: 28px;
      }
      .field {
        --background: var(--board-search-bg);
        --color: var(--board-ink);
        --placeholder-color: var(--board-muted);
        --border-radius: 8px;
        margin-bottom: 12px;
      }
      .row2 {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0 12px;
      }
      @media (min-width: 560px) {
        .row2 {
          grid-template-columns: 1fr 1fr;
        }
      }
      .lbl {
        font-size: 12px;
        color: var(--board-muted);
        margin: 0 0 6px;
      }
      .native-date {
        width: 100%;
        border: 0;
        background: transparent;
        padding: 10px 0;
        font: inherit;
        color: inherit;
      }
      .right section {
        margin-bottom: 24px;
      }
      .dropzone {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--board-search-bg);
        border-radius: 8px;
        padding: 14px;
        font-size: 12.5px;
        color: var(--board-muted);
        cursor: pointer;
        margin: 8px 0 12px;
      }
      .dropzone em {
        color: #2563eb;
        font-style: normal;
      }
      .activity p {
        margin: 4px 0;
        font-size: 12.5px;
        color: var(--board-muted);
      }
    `,
  ],
})
export class TaskDetailModalComponent implements OnInit {
  @Input() taskId: string | null = null;
  @Input() columnId: ColumnId = 'todo';

  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  protected readonly store = inject(BoardStoreService);
  private readonly toast = inject(ToastService);

  protected readonly labels = TASK_LABELS;
  protected readonly priorities = PRIORITIES;

  title = '';
  description = '';
  assigneeIds: string[] = [];
  dueDate: string | null = null;
  colId: ColumnId = 'todo';
  label: TaskLabel = 'Feature';
  priority: Priority | undefined = undefined;
  coverImage: string | null = null;

  /** Checklist & attachment lokal untuk mode create */
  private localChecklist: Task['checklist'] = [];
  private localAttachments: Attachment[] = [];
  private version = 0;

  constructor() {
    addIcons({ checkmarkDoneOutline, closeOutline, cloudUploadOutline, imageOutline, trashOutline });
  }

  ngOnInit(): void {
    const existing = this.taskId ? this.store.getTask(this.taskId) : undefined;
    if (existing) {
      this.title = existing.title;
      this.description = existing.description;
      this.assigneeIds = [...existing.assigneeIds];
      this.dueDate = existing.dueDate;
      this.colId = existing.columnId;
      this.label = existing.label;
      this.priority = existing.priority;
      this.coverImage = existing.coverImage ?? null;
    } else {
      this.colId = this.columnId;
    }
  }

  editing(): Task | undefined {
    return this.taskId ? this.store.getTask(this.taskId) : undefined;
  }

  fmtDate(iso: string | undefined): string {
    if (!iso) return '-';
    try {
      const d = iso.length <= 10 ? parseISO(iso) : new Date(iso);
      return format(d, 'd MMM yyyy, HH:mm');
    } catch {
      return iso;
    }
  }

  checklistItems(): Task['checklist'] {
    const live = this.editing()?.checklist;
    if (live) return live;
    // Baca versi lokal agar template refresh saat mode create
    void this.version;
    return this.localChecklist;
  }

  attachmentItems(): Attachment[] {
    const live = this.editing()?.attachments;
    if (live) return live;
    void this.version;
    return this.localAttachments;
  }

  toggleAssignee(id: string): void {
    this.assigneeIds = this.assigneeIds.includes(id)
      ? this.assigneeIds.filter((x) => x !== id)
      : [...this.assigneeIds, id];
  }

  pickCover(): void {
    this.coverImage = randomCover();
  }

  toggleSubtask(subId: string): void {
    if (this.taskId) this.store.toggleSubtask(this.taskId, subId);
    else {
      this.localChecklist = this.localChecklist.map((s) =>
        s.id === subId ? { ...s, done: !s.done } : s,
      );
      this.version++;
    }
  }

  addSubtask(title: string): void {
    if (this.taskId) this.store.addSubtask(this.taskId, title);
    else {
      this.localChecklist = [
        ...this.localChecklist,
        { id: `sub-${Date.now().toString(36)}`, title, done: false },
      ];
      this.version++;
    }
  }

  removeSubtask(subId: string): void {
    if (this.taskId) this.store.removeSubtask(this.taskId, subId);
    else {
      this.localChecklist = this.localChecklist.filter((s) => s.id !== subId);
      this.version++;
    }
  }

  onFiles(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    const list = Array.from(files).map((f) => ({
      id: `att-${Date.now().toString(36)}-${f.name}`,
      name: f.name,
      size: formatSize(f.size),
      mime: f.type || 'application/octet-stream',
    }));
    if (this.taskId) {
      for (const att of list) this.store.addAttachment(this.taskId, att);
    } else {
      this.localAttachments = [...this.localAttachments, ...list];
      this.version++;
    }
    (event.target as HTMLInputElement).value = '';
  }

  removeAttachment(attId: string): void {
    if (this.taskId) this.store.removeAttachment(this.taskId, attId);
    else {
      this.localAttachments = this.localAttachments.filter((a) => a.id !== attId);
      this.version++;
    }
  }

  async save(): Promise<void> {
    if (!this.title.trim()) return;
    if (this.taskId) {
      this.store.updateTask(this.taskId, {
        title: this.title.trim(),
        description: this.description,
        assigneeIds: this.assigneeIds,
        dueDate: this.dueDate || null,
        columnId: this.colId,
        label: this.label,
        priority: this.priority,
        coverImage: this.coverImage,
      });
      // Normalisasi order bila pindah column via dropdown
      const current = this.store.getTask(this.taskId);
      if (current && current.columnId !== this.colId) {
        const count = this.store.tasks().filter((t) => t.columnId === this.colId).length;
        this.store.moveTask(this.taskId, this.colId, count);
      }
      // Pastikan columnId tersimpan walau moveTask tidak dipanggil
      this.store.updateTask(this.taskId, { columnId: this.colId });
      await this.toast.updated();
      await this.modalCtrl.dismiss(null, 'saved');
    } else {
      this.store.createTask({
        columnId: this.colId,
        title: this.title.trim(),
        description: this.description,
        assigneeIds: this.assigneeIds,
        dueDate: this.dueDate || null,
        label: this.label,
        priority: this.priority,
        coverImage: this.coverImage,
        checklist: this.localChecklist,
        attachments: this.localAttachments,
      });
      await this.toast.created();
      await this.modalCtrl.dismiss(null, 'saved');
    }
  }

  async markComplete(): Promise<void> {
    if (!this.taskId) return;
    const dest = this.store.tasks().filter((t) => t.columnId === 'done').length;
    this.store.moveTask(this.taskId, 'done', dest);
    await this.toast.moved('Done');
    await this.modalCtrl.dismiss(null, 'saved');
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete task?',
      message: 'Deleted tasks cannot be restored.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            if (this.taskId) this.store.deleteTask(this.taskId);
            await this.toast.deleted();
            await this.modalCtrl.dismiss(null, 'deleted');
          },
        },
      ],
    });
    await alert.present();
  }

  dismiss(): Promise<boolean> {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
