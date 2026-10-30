import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() title = 'No data available';
  @Input() message = 'There is nothing to display right now.';
  @Input() icon = 'inbox';
  @Input() actionLabel = '';
  @Input() variant: 'empty' | 'error' | 'loading' = 'empty';

  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}