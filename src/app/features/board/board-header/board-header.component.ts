import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { IonBadge, IonButton, IonIcon, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronDownOutline,
  funnelOutline,
  globeOutline,
  lockClosedOutline,
  moonOutline,
  personAddOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { BoardStoreService } from '@app/core/services/board-store.service';
import { AvatarStackComponent } from '@app/shared/components/avatar-stack/avatar-stack.component';

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [IonBadge, IonButton, IonIcon, IonSearchbar, AvatarStackComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar">
      <div class="left">
        <button class="workspace" (click)="openWorkspace.emit($event)" aria-label="Switch board">
          <ion-icon name="lock-closed-outline" class="lock"></ion-icon>
          <strong>Adhivasindo</strong>
          <ion-icon name="chevron-down-outline"></ion-icon>
        </button>
        <app-avatar-stack [members]="store.members()" [max]="4" />
        <ion-button size="small" class="invite" (click)="invite.emit()">
          <ion-icon name="person-add-outline" slot="start"></ion-icon>
          Invite
        </ion-button>
      </div>

      <div class="right">
        <ion-button size="small" fill="clear" class="tool" (click)="openFilter.emit($event)" aria-label="Filter tasks">
          <ion-icon name="funnel-outline" slot="start"></ion-icon>
          Filter
          @if (activeFilterCount() > 0) {
            <ion-badge color="primary" class="fbadge">{{ activeFilterCount() }}</ion-badge>
          }
        </ion-button>
        <ion-button
          size="small"
          fill="clear"
          class="tool"
          (click)="exportImport.emit($event)"
          aria-label="Export or import board"
        >
          <ion-icon name="globe-outline" slot="start"></ion-icon>
          Export / Import
        </ion-button>
        <ion-button
          size="small"
          fill="clear"
          class="tool icon-only"
          (click)="toggleTheme.emit()"
          [attr.aria-label]="dark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <ion-icon [name]="dark() ? 'sunny-outline' : 'moon-outline'" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-searchbar
          class="search"
          placeholder="Search Tasks"
          [value]="search()"
          (ionInput)="searchChange.emit($event.detail.value ?? '')"
          (ionClear)="searchChange.emit('')"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 16px;
        background: var(--board-header-bg);
        border-bottom: 1px solid var(--board-line);
        position: sticky;
        top: 0;
        z-index: 5;
        flex-wrap: wrap;
      }
      .left,
      .right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .workspace {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 15px;
        font-family: inherit;
        color: var(--board-ink);
        background: transparent;
        border: 0;
        border-radius: 8px;
        padding: 6px 8px;
        margin-left: -8px;
        cursor: pointer;
      }
      .workspace:hover {
        background: var(--board-search-bg);
      }
      .workspace .lock {
        font-size: 14px;
        color: var(--board-muted);
      }
      .invite {
        --background: var(--board-search-bg);
        --color: var(--board-ink);
        --border-radius: 8px;
        --box-shadow: none;
        --padding-start: 12px;
        --padding-end: 12px;
        font-weight: 600;
        text-transform: none;
      }
      .tool {
        --color: var(--board-ink);
        text-transform: none;
        font-weight: 600;
      }
      .tool.icon-only {
        --padding-start: 6px;
        --padding-end: 6px;
      }
      .fbadge {
        margin-left: 4px;
      }
      .search {
        --background: var(--board-search-bg);
        --color: var(--board-ink);
        --placeholder-color: var(--board-muted);
        --icon-color: var(--board-muted);
        --border-radius: 8px;
        --box-shadow: none;
        width: 220px;
        padding: 0;
      }
      @media (max-width: 767px) {
        .search {
          width: 100%;
          order: 5;
        }
      }
    `,
  ],
})
export class BoardHeaderComponent {
  protected readonly store = inject(BoardStoreService);

  readonly search = input('');
  readonly activeFilterCount = input(0);
  readonly dark = input(false);

  readonly searchChange = output<string>();
  readonly openFilter = output<Event>();
  readonly openWorkspace = output<Event>();
  readonly exportImport = output<Event>();
  readonly toggleTheme = output<void>();
  readonly invite = output<void>();

  constructor() {
    addIcons({
      chevronDownOutline,
      funnelOutline,
      globeOutline,
      lockClosedOutline,
      moonOutline,
      personAddOutline,
      sunnyOutline,
    });
  }
}
