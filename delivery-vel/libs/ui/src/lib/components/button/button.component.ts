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
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ];

    // Size classes
    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-6', 'py-3', 'text-base']
    };

    // Variant classes
    const variantClasses = {
      primary: [
        'bg-primary-600',
        'hover:bg-primary-700',
        'text-white',
        'focus:ring-primary-500'
      ],
      secondary: [
        'bg-secondary-600',
        'hover:bg-secondary-700',
        'text-white',
        'focus:ring-secondary-500'
      ],
      outline: [
        'border',
        'border-gray-300',
        'hover:border-gray-400',
        'text-gray-700',
        'hover:text-gray-900',
        'bg-white',
        'hover:bg-gray-50',
        'focus:ring-gray-500'
      ],
      ghost: [
        'text-gray-700',
        'hover:text-gray-900',
        'hover:bg-gray-100',
        'focus:ring-gray-500'
      ],
      danger: [
        'bg-red-600',
        'hover:bg-red-700',
        'text-white',
        'focus:ring-red-500'
      ]
    };

    // Full width
    const widthClasses = this.fullWidth ? ['w-full'] : [];

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant],
      ...widthClasses
    ].join(' ');
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}