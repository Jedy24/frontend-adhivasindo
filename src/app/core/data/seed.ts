import { format, addDays } from 'date-fns';
import type { BoardColumn, Task } from '@app/core/models/board.model';

const iso = (offsetDays: number): string => format(addDays(new Date(), offsetDays), 'yyyy-MM-dd');
const nowIso = (): string => new Date().toISOString();

let seq = 0;
const uid = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

function makeTask(partial: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const stamp = nowIso();
  return { ...partial, id: uid('task'), createdAt: stamp, updatedAt: stamp };
}

export const SEED_COLUMNS: BoardColumn[] = [
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'doing', title: 'Doing', order: 1 },
  { id: 'review', title: 'Review', order: 2 },
  { id: 'done', title: 'Done', order: 3 },
  { id: 'rework', title: 'Rework', order: 4 },
];

export function buildSeedTasks(): Task[] {
  return [
    makeTask({
      columnId: 'todo',
      order: 0,
      title: 'Research for a podcast and video website',
      description: 'Research competitors and collect layout references for the podcast and video pages.',
      assigneeIds: ['m-adi', 'm-sari'],
      dueDate: iso(2),
      label: 'Feature',
      priority: 'Medium',
      coverImage: null,
      checklist: [
        { id: uid('sub'), title: 'Collect 5 references', done: true },
        { id: uid('sub'), title: 'Write up findings summary', done: false },
      ],
      attachments: [],
    }),
    makeTask({
      columnId: 'todo',
      order: 1,
      title: 'Debug checkout process for the e-commerce website',
      description: 'Payment flow fails at the confirmation step. Reproduce and fix it.',
      assigneeIds: ['m-budi', 'm-dewi', 'm-eko'],
      dueDate: iso(-1),
      label: 'Bug',
      priority: 'High',
      coverImage: null,
      checklist: [
        { id: uid('sub'), title: 'Reproduce the bug', done: true },
        { id: uid('sub'), title: 'Fix coupon validation', done: false },
        { id: uid('sub'), title: 'Checkout regression test', done: false },
      ],
      attachments: [{ id: uid('att'), name: 'checkout-error.log', size: '14 KB', mime: 'text/plain' }],
    }),
    makeTask({
      columnId: 'todo',
      order: 2,
      title: 'Meeting room setup and interior documentation',
      description: 'Room photos for the office asset archive.',
      assigneeIds: ['m-fitri'],
      dueDate: iso(5),
      label: 'Undefined',
      priority: 'Low',
      coverImage: 'https://picsum.photos/seed/adhivas-room/400/200',
      checklist: [],
      attachments: [],
    }),
    makeTask({
      columnId: 'doing',
      order: 0,
      title: 'Design wireframes for the landing page revamp',
      description: 'Low-fidelity wireframes for the hero, features, and pricing sections.',
      assigneeIds: ['m-dewi', 'm-gilang'],
      dueDate: iso(1),
      label: 'Feature',
      priority: 'Medium',
      coverImage: null,
      checklist: [
        { id: uid('sub'), title: 'Hero section', done: true },
        { id: uid('sub'), title: 'Pricing section', done: false },
      ],
      attachments: [],
    }),
    makeTask({
      columnId: 'doing',
      order: 1,
      title: 'Install and set up a marketing tool for team operations',
      description: 'Install, configure the workspace, and onboard the marketing team.',
      assigneeIds: ['m-adi', 'm-sari', 'm-eko'],
      dueDate: iso(3),
      label: 'Undefined',
      priority: 'Low',
      coverImage: 'https://picsum.photos/seed/adhivas-ops/400/200',
      checklist: [
        { id: uid('sub'), title: 'Create workspace', done: true },
        { id: uid('sub'), title: 'Invite team members', done: true },
        { id: uid('sub'), title: 'Write a quick guide', done: false },
      ],
      attachments: [{ id: uid('att'), name: 'tool-guide.pdf', size: '220 KB', mime: 'application/pdf' }],
    }),
    makeTask({
      columnId: 'review',
      order: 0,
      title: 'Create and refine logo designs for the UI brand',
      description: 'Explore 3 logo variants, gather feedback, then finalize.',
      assigneeIds: ['m-sari', 'm-dewi'],
      dueDate: null,
      label: 'Issue',
      priority: 'Medium',
      coverImage: 'https://picsum.photos/seed/adhivas-logo/400/200',
      checklist: [
        { id: uid('sub'), title: 'Variant A', done: true },
        { id: uid('sub'), title: 'Variant B', done: true },
        { id: uid('sub'), title: 'Finalize', done: false },
      ],
      attachments: [],
    }),
    makeTask({
      columnId: 'review',
      order: 1,
      title: 'Create an icon library for the project',
      description: 'Audit existing icons; unify to a 24px grid with 1.5px stroke.',
      assigneeIds: ['m-budi'],
      dueDate: iso(0),
      label: 'Feature',
      priority: 'Low',
      coverImage: null,
      checklist: [
        { id: uid('sub'), title: 'Audit existing icons', done: true },
        { id: uid('sub'), title: 'Redraw 18 icons', done: false },
      ],
      attachments: [],
    }),
    makeTask({
      columnId: 'done',
      order: 0,
      title: 'Create the Email Page layout and necessary components',
      description: 'Email page layout finished and reviewed.',
      assigneeIds: ['m-eko', 'm-fitri'],
      dueDate: iso(-4),
      label: 'Feature',
      priority: 'Medium',
      coverImage: null,
      checklist: [
        { id: uid('sub'), title: 'Layout', done: true },
        { id: uid('sub'), title: 'Components', done: true },
      ],
      attachments: [],
    }),
    makeTask({
      columnId: 'done',
      order: 1,
      title: 'Enhance website usability through user feedback',
      description: 'Fixes from the first usability testing round.',
      assigneeIds: ['m-adi', 'm-gilang'],
      dueDate: iso(-2),
      label: 'Feature',
      priority: 'Low',
      coverImage: null,
      checklist: [],
      attachments: [],
    }),
    makeTask({
      columnId: 'done',
      order: 2,
      title: 'Office kitchen and pantry documentation',
      description: 'Final pantry photos for the renovation archive.',
      assigneeIds: [],
      dueDate: null,
      label: 'Undefined',
      priority: 'Low',
      coverImage: 'https://picsum.photos/seed/adhivas-pantry/400/200',
      checklist: [],
      attachments: [],
    }),
    makeTask({
      columnId: 'rework',
      order: 0,
      title: 'Blog Edit Page Modification and Playlist Page Design',
      description: 'Revise the blog edit page and playlist design per reviewer feedback.',
      assigneeIds: ['m-adi', 'm-sari'],
      dueDate: iso(2),
      label: 'Feature',
      priority: 'High',
      coverImage: null,
      checklist: [
        { id: uid('sub'), title: 'Fix the editor', done: true },
        { id: uid('sub'), title: 'Design the playlist', done: false },
      ],
      attachments: [{ id: uid('att'), name: 'reviewer-feedback.txt', size: '3 KB', mime: 'text/plain' }],
    }),
    makeTask({
      columnId: 'rework',
      order: 1,
      title: 'Plan and execute training sessions for new hires',
      description: 'Prepare onboarding materials and schedule sessions for next week.',
      assigneeIds: ['m-budi'],
      dueDate: iso(4),
      label: 'Issue',
      priority: 'Medium',
      coverImage: 'https://picsum.photos/seed/adhivas-training/400/240',
      checklist: [
        { id: uid('sub'), title: 'Day 1 material', done: true },
        { id: uid('sub'), title: 'Day 2 material', done: false },
        { id: uid('sub'), title: 'Mentor schedule', done: false },
      ],
      attachments: [],
    }),
  ];
}
