import { Component, signal, inject, computed } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  taskService = inject(TaskService);
  userName = signal('Raushan');

  // Reactively calculate statistics based on the shared task state
  stats = computed(() => {
    const activeTasks = this.taskService.tasks();
    const totalCount = activeTasks.length;
    const completedCount = activeTasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;
    const highPriorityCount = activeTasks.filter(t => t.priority === 'high' && !t.completed).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return [
      { label: 'Total Tasks', value: totalCount, change: '+12% from last week', icon: 'list', color: '#3b82f6' },
      { label: 'Completed', value: completedCount, change: `${completionRate}% completion rate`, icon: 'check', color: '#10b981' },
      { label: 'In Progress', value: pendingCount, change: `${pendingCount} active items`, icon: 'clock', color: '#f59e0b' },
      { label: 'High Priority', value: highPriorityCount, change: 'Due soon', icon: 'alert', color: '#ef4444' }
    ];
  });

  // Expose the shared tasks signal directly
  tasks = this.taskService.tasks;

  toggleTask(taskId: number): void {
    this.taskService.toggleTask(taskId);
  }
}
