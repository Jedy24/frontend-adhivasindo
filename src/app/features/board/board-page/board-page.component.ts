import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, OnInit, viewChild } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import {
  ActionSheetController,
  IonContent,
  IonIcon,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import type { ColumnId, Task } from '@app/core/models/board.model';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ToastService } from '@app/core/services/toast.service';
import { BoardHeaderComponent } from '@app/features/board/board-header/board-header.component';
import { BoardColumnComponent } from '@app/features/board/board-column/board-column.component';
import { FilterPopoverComponent } from '@app/features/board/filter-popover/filter-popover.component';
import { WorkspaceMenuComponent } from '@app/features/board/workspace-menu/workspace-menu.component';
import {
  PromptModalComponent,
  type PromptResult,
} from '@app/shared/components/prompt-modal/prompt-modal.component';
import { TaskDetailModalComponent } from '@app/features/task-detail/task-detail-modal/task-detail-modal.component';
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [
    DragDropModule,
    IonContent,
    IonIcon,
    BoardHeaderComponent,
    BoardColumnComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-content>
      <div class="page">
        <app-board-header
          [search]="store.filter().search"
          [activeFilterCount]="activeFilterCount()"
          [dark]="theme.dark()"
          (searchChange)="onSearch($event)"
          (openFilter)="openFilter($event)"
          (openWorkspace)="openWorkspace($event)"
          (exportImport)="openExportImport()"
          (toggleTheme)="theme.toggle()"
          (invite)="invite()"
        />

        @if (store.isFiltering() && totalVisible() === 0) {
          <app-empty-state
            title="No matching tasks"
            subtitle="Try a different keyword or clear the filters."
            actionLabel="Clear filters"
            (action)="store.clearFilter()"
          />
        }

        <div class="board-scroll" cdkDropListGroup #boardScroll>
          @for (col of store.columns(); track col.id) {
            <app-board-column
              [column]="col"
              [tasks]="store.tasksByColumn()[col.id]"
              [connectedTo]="connectedIds()"
              (dropped)="onDrop($event)"
              (add)="createTask($event)"
              (open)="openDetail($event)"
            />
          }
          <button class="add-list" (click)="addListInfo()" aria-label="Add new list">
            <ion-icon name="add-outline"></ion-icon>
            Add new List
          </button>
        </div>
      </div>

      <input #importInput type="file" accept="application/json" hidden (change)="onImportFile($event)" />
    </ion-content>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      ion-content {
        --background: var(--ion-background-color);
        --overflow: hidden;
      }
      .page {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .page app-board-header {
        flex: 0 0 auto;
      }
      .page .board-scroll {
        flex: 1 1 auto;
        min-height: 0;
      }
      .add-list {
        flex: 0 0 220px;
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 12px;
        border: 0;
        border-radius: var(--board-radius);
        background: var(--board-header-bg);
        color: var(--board-muted);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
      }
      .add-list:hover {
        color: #2563eb;
      }
    `,
  ],
})
export class BoardPageComponent implements OnInit {
  protected readonly store = inject(BoardStoreService);
  protected readonly theme = inject(ThemeService);
  private readonly modalCtrl = inject(ModalController);
  private readonly popoverCtrl = inject(PopoverController);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly toast = inject(ToastService);

  private readonly importInput = viewChild.required<ElementRef<HTMLInputElement>>('importInput');
  private readonly boardScroll = viewChild<ElementRef<HTMLDivElement>>('boardScroll');
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly connectedIds = computed(() =>
    this.store.columns().map((c) => `list-${c.id}`),
  );

  protected readonly totalVisible = computed(() =>
    Object.values(this.store.tasksByColumn()).reduce((n, list) => n + list.length, 0),
  );

  protected readonly activeFilterCount = computed(() => {
    const f = this.store.filter();
    return (
      f.assigneeIds.length + f.labels.length + (f.due !== 'all' ? 1 : 0) + (f.search.trim() ? 1 : 0)
    );
  });

  constructor() {
    addIcons({ addOutline });
  }

  ngOnInit(): void {
    this.store.hydrate();
  }

  onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.store.setSearch(value), 200);
  }

  async openFilter(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: FilterPopoverComponent,
      event,
      side: 'bottom',
      alignment: 'end',
      translucent: true,
      cssClass: 'board-popover',
    });
    await popover.present();
  }

  async openWorkspace(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: WorkspaceMenuComponent,
      event,
      translucent: true,
      cssClass: 'board-popover',
    });
    await popover.present();
  }

  async openExportImport(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Board data',
      buttons: [
        { text: 'Export as JSON', handler: () => this.exportBoard() },
        { text: 'Import from JSON', handler: () => this.importInput().nativeElement.click() },
        { text: 'Reset to seed data', role: 'destructive', handler: () => this.resetBoard() },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  async openDetail(taskId: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskDetailModalComponent,
      componentProps: { taskId },
      cssClass: 'task-detail-modal',
    });
    await modal.present();
  }

  async createTask(columnId: ColumnId): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskDetailModalComponent,
      componentProps: { taskId: null, columnId },
      cssClass: 'task-detail-modal',
    });
    await modal.present();
  }

  async onDrop(event: CdkDragDrop<Task[]>): Promise<void> {
    const fromId = (event.previousContainer.id.replace('list-', '') || 'todo') as ColumnId;
    const toId = (event.container.id.replace('list-', '') || fromId) as ColumnId;
    const task = event.previousContainer.data[event.previousIndex];
    if (!task) return;
    if (fromId === toId && event.previousIndex === event.currentIndex) return;
    this.store.moveTask(task.id, toId, event.currentIndex);
    const title = this.store.columns().find((c) => c.id === toId)?.title ?? toId;
    await this.toast.moved(title);
  }

  exportBoard(): void {
    const blob = new Blob([this.store.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'board-export.json';
    a.click();
    URL.revokeObjectURL(url);
    void this.toast.notify('Board exported', 'primary');
  }

  async onImportFile(event: Event): Promise<void> {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      this.store.importJSON(text);
      await this.toast.notify('Board imported', 'primary');
    } catch {
      await this.toast.notify('Invalid file format', 'danger');
    }
  }

  async resetBoard(): Promise<void> {
    this.store.resetToSeed();
    await this.toast.notify('Board reset to seed data', 'primary');
  }

  invite(): void {
    void this.toast.notify('Invite link copied (dummy)', 'primary');
  }

  async addListInfo(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PromptModalComponent,
      componentProps: {
        title: 'Add new list',
        placeholder: 'List title',
        value: '',
        confirmLabel: 'Add',
      },
      cssClass: 'prompt-modal',
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<PromptResult>();
    if (role !== 'confirm' || !data?.value.trim()) return;
    const column = this.store.addColumn(data.value);
    await this.toast.notify(`List "${column.title}" added`, 'primary');
    requestAnimationFrame(() => {
      const el = this.boardScroll()?.nativeElement;
      el?.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    });
  }
}
