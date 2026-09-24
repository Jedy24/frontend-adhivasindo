import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="track"
      role="progressbar"
      [attr.aria-valuenow]="pct()"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="fill" [style.width.%]="pct()"></div>
    </div>
  `,
  styles: [
    `
      .track {
        height: 4px;
        border-radius: 999px;
        background: #dbe4f0;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        border-radius: 999px;
        background: #2563eb;
        transition: width 0.3s ease;
      }
    `,
  ],
})
export class ProgressBarComponent {
  readonly pct = input(0);
}
