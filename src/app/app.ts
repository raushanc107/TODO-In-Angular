import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from "./components/side-nav/side-nav";
import { TaskModal } from './components/task-modal/task-modal';
import { DeleteConfirm } from './components/delete-confirm/delete-confirm';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNav, TaskModal, DeleteConfirm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TODO');
}
