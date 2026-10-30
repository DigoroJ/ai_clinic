import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../appointment.service';

@Component({
  selector: 'app-appointment-date-time',
  templateUrl: './appointment-date-time.component.html',
  styleUrls: ['./appointment-date-time.component.scss']
})
export class AppointmentDateTimeComponent implements OnInit {

  today: Date = new Date();
  minimumDate: Date = this.getTomorrow();

  displayedMonth: number;
  displayedYear: number;

  selectedDate: Date | null = null;
  selectedTime = '';

  calendarDays: (number | null)[] = [];

  availableTimes: string[] = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30'
  ];

  constructor(
    private router: Router,
    private appointmentService: AppointmentService
  ) {
    this.displayedMonth = this.minimumDate.getMonth();
    this.displayedYear = this.minimumDate.getFullYear();
  }

  ngOnInit(): void {
    const appointment = this.appointmentService.getAppointment();

    if (appointment.date) {
      const savedDate = this.parseLocalDate(appointment.date);

      if (savedDate >= this.minimumDate) {
        this.selectedDate = savedDate;
        this.displayedMonth = savedDate.getMonth();
        this.displayedYear = savedDate.getFullYear();
        this.selectedTime = appointment.time || '';
      }
    }

    this.generateCalendar();
  }

  private getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  private parseLocalDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  get monthName(): string {
    return new Date(
      this.displayedYear,
      this.displayedMonth,
      1
    ).toLocaleString('en-US', { month: 'long' });
  }

  generateCalendar(): void {
    this.calendarDays = [];

    const firstDay = new Date(
      this.displayedYear,
      this.displayedMonth,
      1
    );

    const daysInMonth = new Date(
      this.displayedYear,
      this.displayedMonth + 1,
      0
    ).getDate();

    let startingDay = firstDay.getDay();
    startingDay = startingDay === 0 ? 6 : startingDay - 1;

    for (let i = 0; i < startingDay; i++) {
      this.calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(day);
    }
  }

  isDateSelectable(day: number): boolean {
    const date = new Date(
      this.displayedYear,
      this.displayedMonth,
      day
    );

    date.setHours(0, 0, 0, 0);

    return date >= this.minimumDate;
  }

  isSelectedDay(day: number): boolean {
    if (!this.selectedDate) {
      return false;
    }

    return (
      this.selectedDate.getDate() === day &&
      this.selectedDate.getMonth() === this.displayedMonth &&
      this.selectedDate.getFullYear() === this.displayedYear
    );
  }

  selectDay(day: number | null): void {
    if (day === null || !this.isDateSelectable(day)) {
      return;
    }

    this.selectedDate = new Date(
      this.displayedYear,
      this.displayedMonth,
      day
    );

    this.selectedDate.setHours(0, 0, 0, 0);

    // Clear the time whenever the date changes.
    this.selectedTime = '';
    this.appointmentService.setDateTime(
      this.formatDateForApi(this.selectedDate),
      ''
    );

    // Availability will be loaded here when the backend endpoint is added.
  }

  previousMonth(): void {
    if (!this.canGoPrevious()) {
      return;
    }

    this.displayedMonth--;

    if (this.displayedMonth < 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    }

    this.generateCalendar();
  }

  nextMonth(): void {
    this.displayedMonth++;

    if (this.displayedMonth > 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    }

    this.generateCalendar();
  }

  canGoPrevious(): boolean {
    return !(
      this.displayedYear === this.minimumDate.getFullYear() &&
      this.displayedMonth === this.minimumDate.getMonth()
    );
  }

  selectTime(time: string): void {
    if (!this.selectedDate) {
      return;
    }

    this.selectedTime = time;

    this.appointmentService.setDateTime(
      this.formatDateForApi(this.selectedDate),
      this.selectedTime
    );
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  get formattedSelectedDate(): string {
    if (!this.selectedDate) {
      return '';
    }

    return this.selectedDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  continue(): void {
    if (!this.selectedDate || !this.selectedTime) {
      return;
    }

    this.appointmentService.setDateTime(
      this.formatDateForApi(this.selectedDate),
      this.selectedTime
    );

    this.router.navigate([
      '/patient/appointment-review'
    ]);
  }
}