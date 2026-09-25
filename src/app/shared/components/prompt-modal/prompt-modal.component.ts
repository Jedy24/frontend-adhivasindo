import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonToolbar,
  ModalController,
} from '@ionic/angular';

export interface PromptResult {
  value: string;
}

@Component({
  selector: 'app-prompt-modal',
  standalone: true,
  imports: [FormsModule, IonButton, IonButtons, IonInput, IonItem, IonToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <h2>{{ title }}</h2>
      @if (message) {
        <p class="msg">{{ message }}</p>
      }
      <ion-item lines="none" class="field">
        <ion-input
          [placeholder]="placeholder"
          [(ngModel)]="value"
          (keyup.enter)="confirm()"
          [autofocus]="true"
        />
      </ion-item>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="cancel()">Cancel</ion-button>
          <ion-button (click)="confirm()" [disabled]="!value.trim()">
            {{ confirmLabel }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .box {
        padding: 20px 20px 8px;
      }
      h2 {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 700;
        color: var(--board-ink, #1f2937);
      }
      .msg {
        margin: 0 0 12px;
        font-size: 13.5px;
        color: var(--board-muted, #64748b);
      }
      .field {
        --background: var(--board-search-bg, #eef2f7);
        --color: var(--board-ink, #1f2937);
        --border-radius: 10px;
        margin: 12px 0 4px;
      }
      ion-toolbar {
        --background: transparent;
      }
      ion-button {
        text-transform: none;
        font-weight: 600;
      }
    `,
  ],
})
export class PromptModalComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() confirmLabel = 'Save';

  private readonly modalCtrl = inject(ModalController);

  cancel(): Promise<boolean> {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(): Promise<boolean> {
    const value = this.value.trim();
    if (!value) return Promise.resolve(false);
    const result: PromptResult = { value };
    return this.modalCtrl.dismiss(result, 'confirm');
  }
}
