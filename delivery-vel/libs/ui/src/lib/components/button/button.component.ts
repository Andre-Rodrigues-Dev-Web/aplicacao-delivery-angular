import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonConfig } from '../../types/ui.types';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      <div class="flex items-center justify-center gap-2">
        <div *ngIf="loading" class="loading-spinner"></div>
        <ng-content></ng-content>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonConfig['variant'] = 'primary';
  @Input() size: ButtonConfig['size'] = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  
  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-brand-red text-white hover:bg-red-600 focus:ring-brand-red',
      secondary: 'bg-brand-olive text-neutral-900 hover:bg-olive-600 focus:ring-brand-olive',
      outline: 'border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white focus:ring-brand-red',
      ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-500',
      danger: 'bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const widthClass = this.fullWidth ? 'w-full' : '';
    
    return [
      baseClasses,
      variantClasses[this.variant],
      sizeClasses[this.size],
      widthClass
    ].filter(Boolean).join(' ');
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}