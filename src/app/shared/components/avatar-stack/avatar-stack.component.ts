import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonAvatar } from '@ionic/angular';
import type { Member } from '@app/core/models/board.model';

@Component({
  selector: 'app-avatar-stack',
  standalone: true,
  imports: [IonAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack" [attr.aria-label]="members().length + ' assignee'">
      @for (m of visible(); track m.id) {
        <ion-avatar class="ava" [title]="m.name">
          <img [src]="m.avatar" [alt]="m.name" loading="lazy" />
        </ion-avatar>
      }
      @if (rest() > 0) {
        <span class="more" [title]="rest() + ' lainnya'">+{{ rest() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .stack {
        display: flex;
        align-items: center;
      }
      .ava {
        width: 24px;
        height: 24px;
        border: 2px solid #fff;
        margin-left: -7px;
      }
      .ava:first-child {
        margin-left: 0;
      }
      .ava img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .more {
        margin-left: -7px;
        min-width: 24px;
        height: 24px;
        padding: 0 5px;
        border-radius: 999px;
        border: 2px solid #fff;
        background: #3b82f6;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class AvatarStackComponent {
  readonly members = input<Member[]>([]);
  readonly max = input(3);

  visible(): Member[] {
    return this.members().slice(0, this.max());
  }

  rest(): number {
    return Math.max(0, this.members().length - this.max());
  }
}
