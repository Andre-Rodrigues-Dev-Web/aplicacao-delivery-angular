import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardData } from '../../types/ui.types';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'ui-product-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="product-card" [class.unavailable]="!product.available">
      <!-- Image Container -->
      <div class="product-image-container">
        <img 
          [src]="product.image" 
          [alt]="product.name"
          class="product-image"
          loading="lazy"
        />
        
        <!-- Discount Badge -->
        <ui-badge 
          *ngIf="product.discount && product.discount > 0"
          variant="error"
          class="discount-badge"
        >
          -{{ product.discount }}%
        </ui-badge>
        
        <!-- Unavailable Overlay -->
        <div *ngIf="!product.available" class="unavailable-overlay">
          <span class="unavailable-text">Indisponível</span>
        </div>
      </div>
      
      <!-- Content -->
      <div class="product-content">
        <!-- Category -->
        <span class="product-category">{{ product.category }}</span>
        
        <!-- Name -->
        <h3 class="product-name">{{ product.name }}</h3>
        
        <!-- Description -->
        <p class="product-description">{{ product.description }}</p>
        
        <!-- Tags -->
        <div *ngIf="product.tags && product.tags.length > 0" class="product-tags">
          <span 
            *ngFor="let tag of product.tags" 
            class="product-tag"
          >
            {{ tag }}
          </span>
        </div>
        
        <!-- Rating -->
        <div *ngIf="product.rating" class="product-rating">
          <div class="stars">
            <span 
              *ngFor="let star of getStars()" 
              class="star"
              [class.filled]="star <= product.rating!"
            >
              ★
            </span>
          </div>
          <span class="rating-text">
            {{ product.rating }} ({{ product.reviewCount || 0 }} avaliações)
          </span>
        </div>
        
        <!-- Price -->
        <div class="product-price">
          <span 
            *ngIf="product.originalPrice && product.originalPrice > product.price" 
            class="original-price"
          >
            R$ {{ product.originalPrice | number:'1.2-2' }}
          </span>
          <span class="current-price">
            R$ {{ product.price | number:'1.2-2' }}
          </span>
        </div>
        
        <!-- Actions -->
        <div class="product-actions">
          <ui-button
            variant="outline"
            size="sm"
            (clicked)="onViewDetails()"
            [disabled]="!product.available"
          >
            Ver Detalhes
          </ui-button>
          
          <ui-button
            variant="primary"
            size="sm"
            (clicked)="onAddToCart()"
            [disabled]="!product.available"
          >
            Adicionar
          </ui-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      @apply bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg;
    }
    
    .product-card.unavailable {
      @apply opacity-75;
    }
    
    .product-image-container {
      @apply relative h-48 overflow-hidden;
    }
    
    .product-image {
      @apply w-full h-full object-cover transition-transform duration-300 group-hover:scale-105;
    }
    
    .discount-badge {
      @apply absolute top-2 left-2;
    }
    
    .unavailable-overlay {
      @apply absolute inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center;
    }
    
    .unavailable-text {
      @apply text-white font-semibold text-lg;
    }
    
    .product-content {
      @apply p-4;
    }
    
    .product-category {
      @apply text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1;
    }
    
    .product-name {
      @apply text-lg font-semibold text-neutral-900 mb-2 line-clamp-1;
    }
    
    .product-description {
      @apply text-sm text-neutral-600 mb-3 line-clamp-2;
    }
    
    .product-tags {
      @apply flex flex-wrap gap-1 mb-3;
    }
    
    .product-tag {
      @apply px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-md;
    }
    
    .product-meta {
      @apply flex items-center justify-between mb-3 text-xs text-neutral-500;
    }
    
    .rating-container {
      @apply flex items-center gap-1;
    }
    
    .rating-star {
      @apply text-yellow-400;
    }
    
    .rating-text {
      @apply text-xs text-neutral-500;
    }
    
    .product-price {
      @apply flex items-center gap-2;
    }
    
    .original-price {
      @apply text-sm text-neutral-500 line-through;
    }
    
    .current-price {
      @apply text-lg font-bold text-brand-red;
    }
    
    .product-actions {
      @apply flex gap-2 pt-2;
    }
    
    .product-actions ui-button {
      @apply flex-1;
    }
    
    /* Utility classes */
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductCardData;
  
  @Output() viewDetails = new EventEmitter<ProductCardData>();
  @Output() addToCart = new EventEmitter<ProductCardData>();

  getStars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.product);
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }
}