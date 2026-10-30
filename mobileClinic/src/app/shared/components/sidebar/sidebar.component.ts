import { Component } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  private allMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: ['admin']
    },
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/nurse/dashboard',
      roles: ['nurse']
    },
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/doctor/dashboard',
      roles: ['doctor']
    },
    {
      label: 'Patients',
      icon: 'people',
      route: '/patients',
      roles: ['admin', 'nurse', 'doctor']
    },
    {
      label: 'Doctors',
      icon: 'medical_services',
      route: '/doctors',
      roles: ['admin']
    },
    {
      label: 'Nurses',
      icon: 'health_and_safety',
      route: '/nurses',
      roles: ['admin']
    },
    {
      label: 'Appointments',
      icon: 'calendar_month',
      route: '/appointments',
      roles: ['admin', 'nurse', 'doctor']
    },
    {
      label: 'Medical Records',
      icon: 'description',
      route: '/medical-records',
      roles: ['admin', 'nurse', 'doctor']
    },
    {
      label: 'AI Triage',
      icon: 'psychology',
      route: '/ai-triage',
      roles: ['admin', 'nurse', 'doctor']
    },
    {
      label: 'AI Analytics',
      icon: 'analytics',
      route: '/ai-analytics',
      roles: ['admin', 'doctor']
    },
    {
      label: 'Dataset & EDA',
      icon: 'dataset',
      route: '/dataset-eda',
      roles: ['admin']
    },
    {
      label: 'Reports',
      icon: 'bar_chart',
      route: '/reports',
      roles: ['admin']
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      roles: ['admin']
    }
  ];

  constructor(private auth: AuthService) {}

  /** Only the links the logged-in role is allowed to open. */
  get menuItems(): MenuItem[] {
    return this.allMenuItems.filter(item => this.auth.hasRole(item.roles));
  }

}