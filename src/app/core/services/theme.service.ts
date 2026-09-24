import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'adhivasindo-theme';
const DARK_CLASS = 'ion-palette-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(false);

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(saved ? saved === 'dark' : prefersDark, false);
  }

  toggle(): void {
    const el = document.documentElement;
    // Aktifkan transisi dulu ( + reflow ) agar perubahan variabel ikut teranimasi,
    // lalu lepas lagi setelah selesai supaya tidak mengganggu animasi lain.
    el.classList.add('theme-transition');
    void el.offsetWidth;
    this.apply(!this.dark());
    window.setTimeout(() => el.classList.remove('theme-transition'), 450);
  }

  private apply(value: boolean, persist = true): void {
    this.dark.set(value);
    document.documentElement.classList.toggle(DARK_CLASS, value);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
      } catch {
        // Abaikan bila storage tidak tersedia.
      }
    }
  }
}
