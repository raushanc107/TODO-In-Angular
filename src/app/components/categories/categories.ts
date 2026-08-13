import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, Category } from '../../services/task.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories {
  taskService = inject(TaskService);

  // Active Selected Category state
  selectedCategoryId = signal<string>('cat-coding');

  // Inline forms state
  isAddingCategory = signal(false);
  isEditingCategory = signal(false);

  // New Category input signals
  newCategoryName = signal('');
  newCategoryColor = signal('#3b82f6');
  newCategoryIcon = signal('💼');

  // Edit Category input signals
  editCategoryName = signal('');
  editCategoryColor = signal('#3b82f6');
  editCategoryIcon = signal('💼');

  // Delete Confirmation state
  isDeleteConfirmOpen = signal(false);
  deleteReassignTasks = signal(true); // Reassign to General by default

  // Accent Colors Presets
  colorPresets = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f43f5e', // Rose
    '#a855f7', // Purple
    '#eab308', // Amber
    '#6366f1', // Indigo
    '#f97316', // Orange
    '#64748b'  // Slate
  ];

  // Icon Emojis Presets
  iconPresets = ['💼', '💻', '🎨', '🧪', '📊', '👤', '🏷️', '🏠', '🛒', '🎓', '✈️', '❤️', '🍎', '💡'];

  // Reactive Stats per Category
  categoryStats = computed(() => {
    const tasks = this.taskService.tasks();
    const categories = this.taskService.categories();

    return categories.map(cat => {
      const catTasks = tasks.filter(t => t.category.toLowerCase() === cat.name.toLowerCase());
      const total = catTasks.length;
      const completed = catTasks.filter(t => t.completed).length;
      const active = total - completed;
      const progress = total > 0 ? (completed / total) : 0;

      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        total,
        completed,
        active,
        progress
      };
    });
  });

  // Selected category object
  selectedCategory = computed(() => {
    const categories = this.taskService.categories();
    return categories.find(c => c.id === this.selectedCategoryId()) || categories[0];
  });

  // Tasks in the selected category
  selectedCategoryTasks = computed(() => {
    const activeCat = this.selectedCategory();
    if (!activeCat) return [];
    return this.taskService.tasks().filter(
      t => t.category.toLowerCase() === activeCat.name.toLowerCase()
    );
  });

  selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
    this.cancelEdit();
  }

  // Task inline actions
  toggleTask(taskId: number): void {
    this.taskService.toggleTask(taskId);
  }

  deleteTask(taskId: number): void {
    this.taskService.requestDelete(taskId);
  }

  // Pre-seed creation modal with active category and open
  addNewTaskOnSelectedCategory(): void {
    const activeCat = this.selectedCategory();
    if (activeCat) {
      this.taskService.openModalWithCategory(activeCat.name);
    }
  }

  // Category Add form controls
  openAddForm(): void {
    this.newCategoryName.set('');
    this.newCategoryColor.set(this.colorPresets[0]);
    this.newCategoryIcon.set(this.iconPresets[0]);
    this.isAddingCategory.set(true);
    this.cancelEdit();
  }

  closeAddForm(): void {
    this.isAddingCategory.set(false);
  }

  submitAddCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;

    // Avoid duplicate category names
    const duplicate = this.taskService.categories().some(
      c => c.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      alert('A category with this name already exists.');
      return;
    }

    this.taskService.addCategory(name, this.newCategoryColor(), this.newCategoryIcon());
    this.closeAddForm();

    // Select the newly added category
    setTimeout(() => {
      const list = this.taskService.categories();
      const last = list[list.length - 1];
      if (last) this.selectedCategoryId.set(last.id);
    }, 50);
  }

  // Category Edit form controls
  openEditForm(): void {
    const cat = this.selectedCategory();
    if (!cat) return;

    this.editCategoryName.set(cat.name);
    this.editCategoryColor.set(cat.color);
    this.editCategoryIcon.set(cat.icon);
    this.isEditingCategory.set(true);
    this.closeAddForm();
  }

  cancelEdit(): void {
    this.isEditingCategory.set(false);
  }

  submitEditCategory(): void {
    const cat = this.selectedCategory();
    if (!cat) return;

    const name = this.editCategoryName().trim();
    if (!name) return;

    // Avoid duplicate names with other categories
    const duplicate = this.taskService.categories().some(
      c => c.id !== cat.id && c.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      alert('A category with this name already exists.');
      return;
    }

    this.taskService.updateCategory(cat.id, name, this.editCategoryColor(), this.editCategoryIcon());
    this.cancelEdit();
  }

  // Category Delete logic
  openDeleteConfirm(): void {
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm(): void {
    this.isDeleteConfirmOpen.set(false);
  }

  confirmDeleteCategory(): void {
    const cat = this.selectedCategory();
    if (!cat) return;

    // Block deletion of General category to prevent empty fallback errors
    if (cat.name.toLowerCase() === 'general') {
      alert('The General category cannot be deleted.');
      this.closeDeleteConfirm();
      return;
    }

    this.taskService.deleteCategory(cat.id, this.deleteReassignTasks());
    this.closeDeleteConfirm();

    // Reset selection to general or first available
    const list = this.taskService.categories();
    const fallback = list.find(c => c.name.toLowerCase() === 'general') || list[0];
    if (fallback) {
      this.selectedCategoryId.set(fallback.id);
    }
  }
}
