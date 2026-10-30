import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  notifications = true;
  emailNotifications = true;
  aiPredictions = true;
  automaticReports = false;

  saveSettings(): void {
    console.log('Settings saved', {
      notifications: this.notifications,
      emailNotifications: this.emailNotifications,
      aiPredictions: this.aiPredictions,
      automaticReports: this.automaticReports
    });
  }
}