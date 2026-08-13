import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks {
  taskService = inject(TaskService);

  // Consume the shared tasks list from TaskService
  tasks = this.taskService.tasks;

  // Search & Filter state signals
  searchQuery = signal('');
  selectedPriority = signal('all');
  selectedCategory = signal('all');
  selectedTab = signal<'all' | 'active' | 'completed'>('active');

  // Extract unique categories from tasks list dynamically
  categories = computed(() => {
    const list = this.tasks().map(t => t.category);
    return ['all', ...Array.from(new Set(list))];
  });

  // Dynamic tab counts based on search, priority, and category
  allCount = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.selectedPriority();
    const category = this.selectedCategory();
    return this.tasks().filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(query) || 
                            task.category.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesCategory = category === 'all' || task.category === category;
      return matchesSearch && matchesPriority && matchesCategory;
    }).length;
  });

  activeCount = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.selectedPriority();
    const category = this.selectedCategory();
    return this.tasks().filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(query) || 
                            task.category.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesCategory = category === 'all' || task.category === category;
      return matchesSearch && matchesPriority && matchesCategory && !task.completed;
    }).length;
  });

  completedCount = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.selectedPriority();
    const category = this.selectedCategory();
    return this.tasks().filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(query) || 
                            task.category.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesCategory = category === 'all' || task.category === category;
      return matchesSearch && matchesPriority && matchesCategory && task.completed;
    }).length;
  });

  // Filter tasks list dynamically based on search, priority, category, and selected tab
  filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.selectedPriority();
    const category = this.selectedCategory();
    const tab = this.selectedTab();

    return this.tasks().filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(query) || 
                            task.category.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesCategory = category === 'all' || task.category === category;
      const matchesTab = tab === 'all' || 
                         (tab === 'active' && !task.completed) || 
                         (tab === 'completed' && task.completed);
      
      return matchesSearch && matchesPriority && matchesCategory && matchesTab;
    });
  });

  toggleTask(taskId: number): void {
    this.taskService.toggleTask(taskId);
  }

  deleteTask(taskId: number): void {
    this.taskService.requestDelete(taskId);
  }
}
