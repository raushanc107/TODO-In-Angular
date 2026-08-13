import { Component, signal, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-modal',
  imports: [FormsModule],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss',
})
export class TaskModal {
  taskService = inject(TaskService);

  // Form fields signals
  newTitle = signal('');
  newCategory = signal('Work');
  newPriority = signal<'low' | 'medium' | 'high'>('medium');
  newDueDate = signal('');

  constructor() {
    // Reactively populate form fields if we are editing an existing task
    effect(() => {
      const task = this.taskService.taskToEdit();
      if (task) {
        this.newTitle.set(task.title);
        this.newCategory.set(task.category);
        this.newPriority.set(task.priority);
        this.newDueDate.set(task.dueDate);
      } else {
        this.newTitle.set('');
        const defaultCat = this.taskService.categories()[0]?.name || 'Work';
        this.newCategory.set(this.taskService.prepopulatedCategory() || defaultCat);
        this.newPriority.set('medium');
        this.newDueDate.set(this.taskService.prepopulatedDueDate() || '');
      }
    }, { allowSignalWrites: true });
  }

  close(): void {
    this.taskService.closeModal();
    this.resetForm();
  }

  submitTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;

    const task = this.taskService.taskToEdit();
    if (task) {
      this.taskService.updateTask(
        task.id,
        title,
        this.newCategory(),
        this.newPriority(),
        this.newDueDate()
      );
    } else {
      this.taskService.addTask(
        title,
        this.newCategory(),
        this.newPriority(),
        this.newDueDate()
      );
    }

    this.close();
  }

  private resetForm(): void {
    this.newTitle.set('');
    this.newCategory.set('Work');
    this.newPriority.set('medium');
    this.newDueDate.set('');
  }
}
