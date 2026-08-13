import { Routes } from '@angular/router';
import { Main } from './components/main/main';
import { Tasks } from './components/tasks/tasks';
import { Calendar } from './components/calendar/calendar';
import { Categories } from './components/categories/categories';
import { Settings } from './components/settings/settings';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: Main
  },
  {
    path: 'tasks',
    component: Tasks
  },
  {
    path: 'calendar',
    component: Calendar
  },
  {
    path: 'categories',
    component: Categories
  },
  {
    path: 'settings',
    component: Settings
  },
  {
    path: '**',
    component: NotFound
  }
];
