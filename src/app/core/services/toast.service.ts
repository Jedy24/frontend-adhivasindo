import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastCtrl = inject(ToastController);

  async notify(message: string, color: 'success' | 'primary' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  created(): Promise<void> {
    return this.notify('Task created');
  }

  updated(): Promise<void> {
    return this.notify('Task updated', 'primary');
  }

  deleted(): Promise<void> {
    return this.notify('Task deleted', 'danger');
  }

  moved(columnTitle: string): Promise<void> {
    return this.notify(`Task moved to ${columnTitle}`, 'primary');
  }
}
