# Frontend Adhivasindo — Task Management Board

Aplikasi Kanban (To Do, Doing, Review, Done, Rework) untuk test frontend Adhivasindo.
Dibangun dengan **Ionic Angular (Angular 22 + Ionic 9)**, Drag & Drop memakai
**Angular CDK**, state memakai **Service Store berbasis Signals** dengan persist
**LocalStorage**.

## Fitur

- Board 5 column + task card (label, cover, due date, checklist progress, attachment count, avatar assignee)
- CRUD task via modal detail 2 kolom (mirip gambar referensi)
- Drag & drop antar column + reorder (CDK DragDrop, dengan fallback dropdown pindah column di modal)
- Checklist subtask + progress bar otomatis
- Filter (assignee, label, due date) + search (debounce 200ms)
- Cover image (acak via picsum / hapus)
- Attachments dummy (nama + ukuran file)
- Toast setiap create/update/delete/move
- Export / Import board (JSON) + reset ke data awal
- Responsif desktop & mobile, animasi hover/drag/modal bawaan Ionic

## Cara jalan

```bash
npm install
npm run dev      # http://localhost:4200
npm run build
```
