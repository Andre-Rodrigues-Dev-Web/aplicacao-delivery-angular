import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeConfig } from '../../types/ui.types';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClasses">
      <span *ngIf="dot" class="badge-dot"></span>
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge-dot {
      @apply w-2 h-2 rounded-full mr-1;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeConfig['variant'] = 'default';
  @Input() size: BadgeConfig['size'] = 'md';
  @Input() dot = false;

  get badgeClasses(): string {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'font-medium',
      'rounded-full'
    ];

    // Size classes
    const sizeClasses = {
      sm: ['px-2', 'py-0.5', 'text-xs'],
      md: ['px-2.5', 'py-0.5', 'text-sm'],
      lg: ['px-3', 'py-1', 'text-sm']
    };

    // Variant classes
    const variantClasses = {
      default: ['bg-gray-100', 'text-gray-800'],
      success: ['bg-green-100', 'text-green-800'],
      warning: ['bg-yellow-100', 'text-yellow-800'],
      error: ['bg-red-100', 'text-red-800'],
      info: ['bg-blue-100', 'text-blue-800']
    };

    // Dot color classes
    const dotClasses = this.dot ? {
      default: 'bg-gray-400',
      success: 'bg-green-400',
      warning: 'bg-yellow-400',
      error: 'bg-red-400',
      info: 'bg-blue-400'
    } : {};

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant]
    ].join(' ');
  }
}