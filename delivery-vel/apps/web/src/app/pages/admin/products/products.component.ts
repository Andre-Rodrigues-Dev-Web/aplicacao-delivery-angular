import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductCategory } from '@delivery-vel/data';

interface AdminProduct extends Product {
  stock: number;
  cost: number;
  isActive: boolean;
  isVegetarian?: boolean;
  options?: { [key: string]: string };
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="products-container">
      <div class="products-header">
        <h2 class="page-title">Gestão de Produtos</h2>
        <button class="btn btn-primary" (click)="openProductModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Novo Produto
        </button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            [(ngModel)]="searchTerm"
            (input)="filterProducts()"
          >
        </div>
        <select [(ngModel)]="categoryFilter" (change)="filterProducts()" class="category-filter">
          <option value="">Todas as Categorias</option>
          <option value="PIZZA">Pizza</option>
          <option value="BURGER">Hambúrguer</option>
          <option value="SUSHI">Sushi</option>
          <option value="BEVERAGE">Bebida</option>
          <option value="DESSERT">Sobremesa</option>
        </select>
        <select [(ngModel)]="statusFilter" (change)="filterProducts()" class="status-filter">
          <option value="">Todos os Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        <div class="product-card" *ngFor="let product of filteredProducts()">
          <div class="product-image">
            <img [src]="product.image" [alt]="product.name" />
            <div class="product-status" [class.active]="product.isActive" [class.inactive]="!product.isActive">
              {{ product.isActive ? 'Ativo' : 'Inativo' }}
            </div>
          </div>
          
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            
            <div class="product-details">
              <div class="detail-row">
                <span class="label">Categoria:</span>
                <span class="value">{{ getCategoryName(product.category) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Preço:</span>
                <span class="value price">R$ {{ formatCurrency(product.price) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Custo:</span>
                <span class="value">R$ {{ formatCurrency(product.cost) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Estoque:</span>
                <span class="value" [class.low-stock]="product.stock < 10">{{ product.stock }} unidades</span>
              </div>
            </div>

            <div class="product-tags" *ngIf="product.isFeatured || product.isVegetarian">
              <span class="tag featured" *ngIf="product.isFeatured">Destaque</span>
              <span class="tag vegetarian" *ngIf="product.isVegetarian">Vegetariano</span>
            </div>
          </div>

          <div class="product-actions">
            <button class="btn btn-sm btn-secondary" (click)="editProduct(product)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Editar
            </button>
            <button 
              class="btn btn-sm" 
              [class.btn-success]="!product.isActive"
              [class.btn-warning]="product.isActive"
              (click)="toggleProductStatus(product)"
            >
              {{ product.isActive ? 'Desativar' : 'Ativar' }}
            </button>
            <button class="btn btn-sm btn-danger" (click)="deleteProduct(product)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
              </svg>
              Excluir
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredProducts().length === 0">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h3>Nenhum produto encontrado</h3>
        <p>Não há produtos que correspondam aos filtros selecionados.</p>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}</h3>
          <button class="close-btn" (click)="closeModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nome do Produto *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name"
                [class.error]="productForm.get('name')?.invalid && productForm.get('name')?.touched"
              >
              <div class="error-message" *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched">
                Nome é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="category">Categoria *</label>
              <select 
                id="category" 
                formControlName="category"
                [class.error]="productForm.get('category')?.invalid && productForm.get('category')?.touched"
              >
                <option value="">Selecione uma categoria</option>
                <option value="PIZZA">Pizza</option>
                <option value="BURGER">Hambúrguer</option>
                <option value="SUSHI">Sushi</option>
                <option value="BEVERAGE">Bebida</option>
                <option value="DESSERT">Sobremesa</option>
              </select>
              <div class="error-message" *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched">
                Categoria é obrigatória
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descrição *</label>
            <textarea 
              id="description" 
              formControlName="description" 
              rows="3"
              [class.error]="productForm.get('description')?.invalid && productForm.get('description')?.touched"
            ></textarea>
            <div class="error-message" *ngIf="productForm.get('description')?.invalid && productForm.get('description')?.touched">
              Descrição é obrigatória
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Preço de Venda *</label>
              <input 
                type="number" 
                id="price" 
                formControlName="price" 
                step="0.01" 
                min="0"
                [class.error]="productForm.get('price')?.invalid && productForm.get('price')?.touched"
              >
              <div class="error-message" *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                Preço deve ser maior que zero
              </div>
            </div>

            <div class="form-group">
              <label for="cost">Custo *</label>
              <input 
                type="number" 
                id="cost" 
                formControlName="cost" 
                step="0.01" 
                min="0"
                [class.error]="productForm.get('cost')?.invalid && productForm.get('cost')?.touched"
              >
              <div class="error-message" *ngIf="productForm.get('cost')?.invalid && productForm.get('cost')?.touched">
                Custo deve ser maior que zero
              </div>
            </div>

            <div class="form-group">
              <label for="stock">Estoque Inicial *</label>
              <input 
                type="number" 
                id="stock" 
                formControlName="stock" 
                min="0"
                [class.error]="productForm.get('stock')?.invalid && productForm.get('stock')?.touched"
              >
              <div class="error-message" *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched">
                Estoque deve ser maior ou igual a zero
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="image">URL da Imagem *</label>
            <input 
              type="url" 
              id="image" 
              formControlName="image"
              [class.error]="productForm.get('image')?.invalid && productForm.get('image')?.touched"
            >
            <div class="error-message" *ngIf="productForm.get('image')?.invalid && productForm.get('image')?.touched">
              URL da imagem é obrigatória
            </div>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isFeatured">
                <span class="checkmark"></span>
                Produto em Destaque
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isVegetarian">
                <span class="checkmark"></span>
                Produto Vegetariano
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isActive">
                <span class="checkmark"></span>
                Produto Ativo
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">
              {{ editingProduct ? 'Atualizar' : 'Criar' }} Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      max-width: 1200px;
    }

    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 250px;
    }

    .search-box svg {
      position: absolute;
      left: 0.75rem;
      color: #64748b;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .category-filter,
    .status-filter {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: white;
      min-width: 150px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-status {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .product-status.active {
      background: #d1fae5;
      color: #065f46;
    }

    .product-status.inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .product-description {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .product-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #64748b;
    }

    .value {
      font-weight: 500;
      color: #1e293b;
    }

    .value.price {
      color: #059669;
      font-weight: 600;
    }

    .value.low-stock {
      color: #dc2626;
      font-weight: 600;
    }

    .product-tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag.featured {
      background: #fef3c7;
      color: #92400e;
    }

    .tag.vegetarian {
      background: #d1fae5;
      color: #065f46;
    }

    .product-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1.5rem 1.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background: #d97706;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
      grid-column: 1 / -1;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      color: #cbd5e1;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      margin: 0;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal {
      background: white;
      border-radius: 0.75rem;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: #64748b;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: #334155;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.875rem;
      color: #374151;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .search-box {
        min-width: auto;
      }

      .product-actions {
        flex-direction: column;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<AdminProduct[]>([]);
  filteredProducts = signal<AdminProduct[]>([]);
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  showModal = false;
  editingProduct: AdminProduct | null = null;
  productForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      cost: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      image: ['', Validators.required],
      isFeatured: [false],
      isVegetarian: [false],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    // Mock data - em uma aplicação real, estes dados viriam de um serviço
    const mockProducts: AdminProduct[] = [
      {
        id: '1',
        name: 'Pizza Margherita',
        description: 'Pizza clássica com molho de tomate, mussarela e manjericão fresco',
        price: 35.90,
        cost: 18.50,
        stock: 25,
        category: {
          id: 'PIZZA',
          name: 'Pizza',
          slug: 'pizza',
          isActive: true,
          sortOrder: 1
        },
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
        isFeatured: true,
        isVegetarian: true,
        isActive: true,
        rating: 4.8,
        reviewCount: 125,
        preparationTime: 25,
        isAvailable: true,
        tags: ['Vegetariano', 'Clássico'],
        ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão'],
        allergens: ['Glúten', 'Lactose'],
        nutritionalInfo: {
          calories: 280,
          protein: 12,
          carbs: 35,
          fat: 10,
          fiber: 2
        },
        restaurant: {
          id: 'rest-1',
          name: 'Pizzaria Italiana',
          slug: 'pizzaria-italiana',
          rating: 4.7,
          reviewCount: 500,
          deliveryTime: 30,
          deliveryFee: 5.90,
          minimumOrder: 25.00,
          isOpen: true,
          cuisine: ['Italiana'],
          address: {
            street: 'Rua das Flores',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          }
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        options: {}
      },
      {
        id: '2',
        name: 'Hambúrguer Clássico',
        description: 'Hambúrguer artesanal com carne bovina, queijo, alface e tomate',
        price: 28.90,
        cost: 15.20,
        stock: 8,
        category: {
          id: 'BURGER',
          name: 'Hambúrguer',
          slug: 'burger',
          isActive: true,
          sortOrder: 2
        },
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isFeatured: false,
        isVegetarian: false,
        isActive: true,
        rating: 4.5,
        reviewCount: 89,
        preparationTime: 15,
        isAvailable: true,
        tags: ['Artesanal', 'Clássico'],
        ingredients: ['Pão brioche', 'Carne bovina', 'Queijo cheddar', 'Alface', 'Tomate'],
        allergens: ['Glúten', 'Lactose'],
        nutritionalInfo: {
          calories: 520,
          protein: 28,
          carbs: 45,
          fat: 25,
          fiber: 3
        },
        restaurant: {
          id: 'rest-2',
          name: 'Burger House',
          slug: 'burger-house',
          rating: 4.6,
          reviewCount: 300,
          deliveryTime: 25,
          deliveryFee: 4.90,
          minimumOrder: 20.00,
          isOpen: true,
          cuisine: ['Americana'],
          address: {
            street: 'Av. Paulista',
            number: '456',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100'
          }
        },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-16'),
        options: {}
      },
      {
        id: '3',
        name: 'Sushi Combo',
        description: 'Combinado de sushi com salmão, atum e camarão',
        price: 45.90,
        cost: 28.30,
        stock: 15,
        category: {
          id: 'SUSHI',
          name: 'Sushi',
          slug: 'sushi',
          isActive: true,
          sortOrder: 3
        },
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        isFeatured: true,
        isVegetarian: false,
        isActive: true,
        rating: 4.9,
        reviewCount: 156,
        preparationTime: 20,
        isAvailable: true,
        tags: ['Fresco', 'Premium'],
        ingredients: ['Arroz japonês', 'Salmão', 'Atum', 'Camarão', 'Nori'],
        allergens: ['Peixe', 'Crustáceos'],
        nutritionalInfo: {
          calories: 380,
          protein: 22,
          carbs: 42,
          fat: 12,
          fiber: 1
        },
        restaurant: {
          id: 'rest-3',
          name: 'Sushi Master',
          slug: 'sushi-master',
          rating: 4.8,
          reviewCount: 450,
          deliveryTime: 35,
          deliveryFee: 6.90,
          minimumOrder: 30.00,
          isOpen: true,
          cuisine: ['Japonesa'],
          address: {
            street: 'Rua da Liberdade',
            number: '789',
            neighborhood: 'Liberdade',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01503-001'
          }
        },
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-17'),
        options: {}
      }
    ];

    this.products.set(mockProducts);
    this.filteredProducts.set(mockProducts);
  }

  filterProducts() {
    let filtered = this.products();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(product => product.category.id === this.categoryFilter);
    }

    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(product => product.isActive === isActive);
    }

    this.filteredProducts.set(filtered);
  }

  getCategoryName(category: ProductCategory): string {
    const categoryNames: { [key: string]: string } = {
      'PIZZA': 'Pizza',
      'BURGER': 'Hambúrguer',
      'SUSHI': 'Sushi',
      'BEVERAGE': 'Bebida',
      'DESSERT': 'Sobremesa'
    };
    return categoryNames[category.id] || category.name || category.id;
  }

  openProductModal(product?: AdminProduct) {
    this.editingProduct = product || null;
    
    if (product) {
      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        image: product.image,
        isFeatured: product.isFeatured,
        isVegetarian: product.isVegetarian,
        isActive: product.isActive
      });
    } else {
      this.productForm.reset({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        stock: 0,
        category: '',
        image: '',
        isFeatured: false,
        isVegetarian: false,
        isActive: true
      });
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  saveProduct() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      
      if (this.editingProduct) {
        // Atualizar produto existente
        const updatedProduct: AdminProduct = {
          ...this.editingProduct,
          ...formValue,
          preparationTime: this.editingProduct.preparationTime,
          ingredients: this.editingProduct.ingredients,
          allergens: this.editingProduct.allergens,
          nutritionalInfo: this.editingProduct.nutritionalInfo,
          options: this.editingProduct.options
        };

        const products = this.products();
        const index = products.findIndex(p => p.id === this.editingProduct!.id);
        if (index !== -1) {
          products[index] = updatedProduct;
          this.products.set([...products]);
        }
      } else {
        // Criar novo produto
        const newProduct: AdminProduct = {
          id: Date.now().toString(),
          ...formValue,
          preparationTime: 15,
          ingredients: [],
          allergens: [],
          nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          },
          options: []
        };

        this.products.set([...this.products(), newProduct]);
      }

      this.filterProducts();
      this.closeModal();
    }
  }

  editProduct(product: AdminProduct) {
    this.openProductModal(product);
  }

  toggleProductStatus(product: AdminProduct) {
    product.isActive = !product.isActive;
    console.log(`Produto ${product.name} ${product.isActive ? 'ativado' : 'desativado'}`);
    // Em uma aplicação real, aqui seria feita a chamada para o serviço
  }

  deleteProduct(product: AdminProduct) {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      const products = this.products().filter(p => p.id !== product.id);
      this.products.set(products);
      this.filterProducts();
      console.log(`Produto ${product.name} excluído`);
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}