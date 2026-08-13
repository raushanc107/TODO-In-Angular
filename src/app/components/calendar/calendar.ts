import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../../services/task.service';

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
  tasksByPriority: { high: number; medium: number; low: number };
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  taskService = inject(TaskService);
  tasks = this.taskService.tasks;

  currentDate = signal<Date>(new Date());
  selectedDate = signal<Date>(new Date());

  // Weekdays header
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current Month and Year label
  monthYearLabel = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  });

  // Calculate standard date string 'YYYY-MM-DD' formatted for local time
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Reactive computed monthly calendar grid (always 42 days)
  calendarDays = computed<CalendarDay[]>(() => {
    const activeDate = this.currentDate();
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    
    // First day of current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of the week for the first day (0 = Sun, 1 = Mon, ...)
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    // Get start date of calendar grid (going back to pad previous month days)
    const startDate = new Date(year, month, 1 - startDayOfWeek);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayStr = this.formatDateString(today);
    const selectedStr = this.formatDateString(this.selectedDate());
    const allTasks = this.tasks();

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      const dateStr = this.formatDateString(d);
      
      // Filter tasks due on this date
      const dayTasks = allTasks.filter(t => t.dueDate === dateStr);
      
      const high = dayTasks.filter(t => t.priority === 'high' && !t.completed).length;
      const medium = dayTasks.filter(t => t.priority === 'medium' && !t.completed).length;
      const low = dayTasks.filter(t => t.priority === 'low' && !t.completed).length;

      days.push({
        date: d,
        dateString: dateStr,
        dayNumber: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedStr,
        tasks: dayTasks,
        tasksByPriority: { high, medium, low }
      });
    }

    return days;
  });

  // Get tasks due on the selected date reactively
  selectedDateTasks = computed(() => {
    const selectedStr = this.formatDateString(this.selectedDate());
    return this.tasks().filter(t => t.dueDate === selectedStr);
  });

  // Navigation handlers
  prevMonth(): void {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }

  goToToday(): void {
    const today = new Date();
    this.currentDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selectedDate.set(today);
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
  }

  // Task modifiers inside side panel
  toggleTask(taskId: number): void {
    this.taskService.toggleTask(taskId);
  }

  deleteTask(taskId: number): void {
    this.taskService.requestDelete(taskId);
  }

  addNewTaskOnSelectedDate(): void {
    const selectedStr = this.formatDateString(this.selectedDate());
    this.taskService.openModalWithDate(selectedStr);
  }
}
