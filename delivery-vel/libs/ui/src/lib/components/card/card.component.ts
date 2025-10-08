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
      @apply border-b border-neutral-200 pb-4 mb-4;
    }
    
    .card-title {
      @apply text-lg font-semibold text-neutral-900 m-0;
    }
    
    .card-subtitle {
      @apply text-sm text-neutral-600 mt-1 m-0;
    }
    
    .card-content {
      @apply flex-1;
    }
    
    .card-footer {
      @apply border-t border-neutral-200 pt-4 mt-4;
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
    const baseClasses = 'bg-white rounded-lg transition-shadow';
    
    const variantClasses = {
      default: 'border border-neutral-200',
      elevated: 'shadow-md hover:shadow-lg',
      outlined: 'border-2 border-neutral-300'
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    
    const hoverClass = this.hoverable ? 'hover:shadow-lg cursor-pointer' : '';
    
    return [
      baseClasses,
      variantClasses[this.variant],
      paddingClasses[this.padding],
      hoverClass
    ].filter(Boolean).join(' ');
  }
}