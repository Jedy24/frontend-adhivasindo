import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TaskLabel } from '@app/core/models/board.model';

@Component({
  selector: 'app-label-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [attr.data-label]="label()">{{ label() }}</span>`,
  styles: [
    `
      .chip {
        display: inline-flex;
        align-items: center;
        font-size: 10.5px;
        font-weight: 600;
        padding: 2px 9px;
        border-radius: 999px;
        line-height: 1.6;
      }
      .chip[data-label='Feature'] {
        background: var(--label-feature-bg);
        color: var(--label-feature-fg);
      }
      .chip[data-label='Bug'] {
        background: var(--label-bug-bg);
        color: var(--label-bug-fg);
      }
      .chip[data-label='Issue'] {
        background: var(--label-issue-bg);
        color: var(--label-issue-fg);
      }
      .chip[data-label='Undefined'] {
        background: var(--label-undefined-bg);
        color: var(--label-undefined-fg);
      }
    `,
  ],
})
export class LabelChipComponent {
  readonly label = input.required<TaskLabel>();
}
