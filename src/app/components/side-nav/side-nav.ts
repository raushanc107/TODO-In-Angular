import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TaskService } from '../../services/task.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss',
})
export class SideNav {
  taskService = inject(TaskService);
  isCollapsed = signal(false);

  userInitials = computed(() => {
    const name = this.taskService.username().trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  });

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/main' },
    { icon: 'tasks', label: 'My Tasks', route: '/tasks' },
    { icon: 'calendar', label: 'Calendar', route: '/calendar' },
    { icon: 'categories', label: 'Categories', route: '/categories' },
    { icon: 'settings', label: 'Settings', route: '/settings' }
  ];

  toggleCollapse(): void {
    this.isCollapsed.update(val => !val);
  }
}
