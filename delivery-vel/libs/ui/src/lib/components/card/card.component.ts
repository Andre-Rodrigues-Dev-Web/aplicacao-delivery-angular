import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardConfig } from '../../types/ui.types';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClasses">
      <div *ngIf="title || subtitle" class="card-header">
        <h3 *ngIf="title" class="card-title">{{ title }}</h3>
        <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="hasFooter" class="card-footer">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      @apply border-b border-gray-200 pb-4 mb-4;
    }
    
    .card-title {
      @apply text-lg font-semibold text-gray-900 m-0;
    }
    
    .card-subtitle {
      @apply text-sm text-gray-600 mt-1 m-0;
    }
    
    .card-content {
      @apply flex-1;
    }
    
    .card-footer {
      @apply border-t border-gray-200 pt-4 mt-4;
    }
  `]
})
export class CardComponent {
  @Input() variant: CardConfig['variant'] = 'default';
  @Input() padding: CardConfig['padding'] = 'md';
  @Input() hoverable = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hasFooter = false;

  get cardClasses(): string {
    const baseClasses = [
      'bg-white',
      'rounded-xl',
      'transition-all',
      'duration-200'
    ];

    // Variant classes
    const variantClasses = {
      default: ['shadow-sm'],
      elevated: ['shadow-lg'],
      outlined: ['border', 'border-gray-200', 'shadow-none']
    };

    // Padding classes
    const paddingClasses = {
      none: [],
      sm: ['p-4'],
      md: ['p-6'],
      lg: ['p-8']
    };

    // Hoverable classes
    const hoverClasses = this.hoverable ? [
      'hover:shadow-lg',
      'hover:-translate-y-1',
      'cursor-pointer'
    ] : [];

    return [
      ...baseClasses,
      ...variantClasses[this.variant],
      ...paddingClasses[this.padding],
      ...hoverClasses
    ].join(' ');
  }
}