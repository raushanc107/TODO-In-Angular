import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  taskService = inject(TaskService);

  // Available brand accent color options
  themeOptions = [
    { value: 'blue', label: 'Classic Blue', color: '#3b82f6', description: 'Default productivity theme' },
    { value: 'rose', label: 'Vibrant Rose', color: '#f43f5e', description: 'Energetic and bold styling' },
    { value: 'purple', label: 'Purple Mist', color: '#a855f7', description: 'Creative and focusing vibes' },
    { value: 'emerald', label: 'Forest Emerald', color: '#10b981', description: 'Relaxing and natural outline' }
  ] as const;

  // Backup Export trigger
  exportTasks(): void {
    try {
      const data = JSON.stringify(this.taskService.tasks(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowtask_export_${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export tasks. Please try again.');
    }
  }

  // Backup Import trigger
  importTasks(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          // Verify format matches Task structure basic fields
          const isValid = parsed.every(
            t => typeof t.title === 'string' &&
                 typeof t.category === 'string' &&
                 typeof t.completed === 'boolean' &&
                 typeof t.dueDate === 'string'
          );

          if (isValid) {
            // Generate clean IDs if imported tasks lack them or duplicate them
            const sanitized = parsed.map((t, idx) => ({
              ...t,
              id: t.id || Date.now() + idx
            }));

            this.taskService.tasks.set(sanitized);
            alert(`Success! Imported ${sanitized.length} tasks.`);
          } else {
            alert('Format Mismatch: File contains invalid task structures.');
          }
        } else {
          alert('Format Mismatch: Exported backup should be a JSON array list.');
        }
      } catch (err) {
        alert('Parsing Error: File is not a valid JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Clear file input
  }

  // Wipes all tasks to empty state
  clearDatabase(): void {
    const confirmWipe = confirm('⚠️ WARNING: Are you sure you want to clear your task board? This action will permanently delete all tasks.');
    if (confirmWipe) {
      this.taskService.tasks.set([]);
      alert('Tasks database has been cleared.');
    }
  }
}
