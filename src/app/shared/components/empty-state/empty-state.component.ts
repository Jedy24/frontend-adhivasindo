import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <p class="title">{{ title() }}</p>
      <p class="sub">{{ subtitle() }}</p>
      @if (actionLabel()) {
        <ion-button size="small" fill="outline" (click)="action.emit()">
          {{ actionLabel() }}
        </ion-button>
      }
    </div>
  `,
  styles: [
    `
      .empty {
        text-align: center;
        padding: 28px 12px;
        color: var(--board-muted);
      }
      .title {
        margin: 0 0 4px;
        font-weight: 700;
        color: var(--board-ink);
      }
      .sub {
        margin: 0 0 12px;
        font-size: 13px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly title = input('No tasks');
  readonly subtitle = input('Try changing the filters or create a new task.');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
