import { Injectable, signal, effect } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Shared task list state
  tasks = signal<Task[]>([
    { id: 1, title: 'Implement Collapsible Navigation', category: 'Coding', priority: 'high', completed: true, dueDate: '2026-08-13' },
    { id: 2, title: 'Review TODO Angular routing integration', category: 'Design', priority: 'medium', completed: false, dueDate: '2026-08-13' },
    { id: 3, title: 'Write automated unit tests for navbar', category: 'Testing', priority: 'low', completed: false, dueDate: '2026-08-14' },
    { id: 4, title: 'Prepare project presentation slides', category: 'Management', priority: 'medium', completed: false, dueDate: '2026-08-15' }
  ]);

  // Shared category list state
  categories = signal<Category[]>([
    { id: 'cat-coding', name: 'Coding', color: '#3b82f6', icon: '💻' },
    { id: 'cat-design', name: 'Design', color: '#f43f5e', icon: '🎨' },
    { id: 'cat-testing', name: 'Testing', color: '#a855f7', icon: '🧪' },
    { id: 'cat-management', name: 'Management', color: '#eab308', icon: '📊' },
    { id: 'cat-personal', name: 'Personal', color: '#10b981', icon: '👤' },
    { id: 'cat-general', name: 'General', color: '#64748b', icon: '🏷️' }
  ]);

  // User Profile & App Settings State
  username = signal('Raushan Gupta');
  userEmail = signal('raushan@example.com');
  defaultPriority = signal<'low' | 'medium' | 'high'>('medium');
  defaultCategory = signal('General');
  soundCompletionEnabled = signal(true);
  themeAccent = signal<'blue' | 'rose' | 'purple' | 'emerald'>('blue');

  constructor() {
    effect(() => {
      const theme = this.themeAccent();
      const body = document.body;
      body.classList.forEach(className => {
        if (className.startsWith('theme-')) {
          body.classList.remove(className);
        }
      });
      body.classList.add(`theme-${theme}`);
    });
  }

  // Shared modal display state
  isModalOpen = signal(false);
  taskToEdit = signal<Task | null>(null);
  prepopulatedDueDate = signal<string>('');
  prepopulatedCategory = signal<string>('');

  // Delete confirmation modal states
  isDeleteConfirmOpen = signal(false);
  taskIdToDelete = signal<number | null>(null);

  openModal(task?: Task): void {
    if (task) {
      this.taskToEdit.set(task);
      this.prepopulatedDueDate.set('');
      this.prepopulatedCategory.set('');
    } else {
      this.taskToEdit.set(null);
    }
    this.isModalOpen.set(true);
  }

  openModalWithDate(dueDate: string): void {
    this.taskToEdit.set(null);
    this.prepopulatedDueDate.set(dueDate);
    this.prepopulatedCategory.set('');
    this.isModalOpen.set(true);
  }

  openModalWithCategory(categoryName: string): void {
    this.taskToEdit.set(null);
    this.prepopulatedDueDate.set('');
    this.prepopulatedCategory.set(categoryName);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.taskToEdit.set(null);
    this.prepopulatedDueDate.set('');
    this.prepopulatedCategory.set('');
  }

  toggleTask(taskId: number): void {
    const task = this.tasks().find(t => t.id === taskId);
    const becomingCompleted = task ? !task.completed : false;

    this.tasks.update(list =>
      list.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    );

    if (becomingCompleted && this.soundCompletionEnabled()) {
      this.playCompletionChime();
    }
  }

  playCompletionChime(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5 note
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5 note
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6 note
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Web Audio API not supported or user gesture required', e);
    }
  }

  // Triggered when user clicks delete - opens custom confirmation modal
  requestDelete(taskId: number): void {
    this.taskIdToDelete.set(taskId);
    this.isDeleteConfirmOpen.set(true);
  }

  confirmDelete(): void {
    const id = this.taskIdToDelete();
    if (id !== null) {
      this.tasks.update(list => list.filter(t => t.id !== id));
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.isDeleteConfirmOpen.set(false);
    this.taskIdToDelete.set(null);
  }

  addTask(title: string, category: string, priority: 'low' | 'medium' | 'high', dueDate: string): void {
    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      category: category.trim() || this.defaultCategory() || 'General',
      priority: priority || this.defaultPriority() || 'medium',
      completed: false,
      dueDate: dueDate || 'Today'
    };
    this.tasks.update(list => [newTask, ...list]);
  }

  updateTask(taskId: number, title: string, category: string, priority: 'low' | 'medium' | 'high', dueDate: string): void {
    this.tasks.update(list =>
      list.map(t => t.id === taskId ? {
        ...t,
        title: title.trim(),
        category: category.trim() || 'General',
        priority,
        dueDate: dueDate || 'Today'
      } : t)
    );
  }

  addCategory(name: string, color: string, icon: string): void {
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: name.trim(),
      color,
      icon
    };
    this.categories.update(list => [...list, newCat]);
  }

  updateCategory(id: string, name: string, color: string, icon: string): void {
    const categoryToUpdate = this.categories().find(c => c.id === id);
    if (!categoryToUpdate) return;
    const oldName = categoryToUpdate.name;
    const newName = name.trim();

    this.categories.update(list =>
      list.map(c => c.id === id ? { ...c, name: newName, color, icon } : c)
    );

    // Update task references
    if (oldName !== newName) {
      this.tasks.update(list =>
        list.map(t => t.category === oldName ? { ...t, category: newName } : t)
      );
    }
  }

  deleteCategory(id: string, reassignToGeneral: boolean): void {
    const categoryToDelete = this.categories().find(c => c.id === id);
    if (!categoryToDelete) return;
    const categoryName = categoryToDelete.name;

    this.categories.update(list => list.filter(c => c.id !== id));

    if (reassignToGeneral) {
      this.tasks.update(list =>
        list.map(t => t.category === categoryName ? { ...t, category: 'General' } : t)
      );
    } else {
      this.tasks.update(list => list.filter(t => t.category !== categoryName));
    }
  }

  getCategoryColor(categoryName: string): string {
    const cat = this.categories().find(
      c => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return cat ? cat.color : '#64748b';
  }
}
