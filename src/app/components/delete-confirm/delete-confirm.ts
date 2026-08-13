import { Component, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-delete-confirm',
  imports: [],
  templateUrl: './delete-confirm.html',
  styleUrl: './delete-confirm.scss',
})
export class DeleteConfirm {
  taskService = inject(TaskService);

  confirm(): void {
    this.taskService.confirmDelete();
  }

  cancel(): void {
    this.taskService.cancelDelete();
  }
}
