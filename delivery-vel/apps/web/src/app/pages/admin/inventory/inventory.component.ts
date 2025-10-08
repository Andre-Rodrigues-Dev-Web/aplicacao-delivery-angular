import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductCategory } from '@delivery-vel/data';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  lastRestocked: Date;
  expirationDate?: Date;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: Date;
  user: string;
  cost?: number;
}

interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="inventory-container">
      <div class="inventory-header">
        <h2 class="page-title">Controle de Estoque</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="openMovementModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
            </svg>
            Movimentação
          </button>
          <button class="btn btn-primary" (click)="openRestockModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Reabastecer
          </button>
        </div>
      </div>

      <!-- Stock Overview -->
      <div class="stock-overview">
        <div class="overview-card">
          <div class="card-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            </svg>
          </div>
          <div class="card-content">
            <h3>{{ getTotalItems() }}</h3>
            <p>Total de Itens</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon value">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="card-content">
            <h3>R$ {{ formatCurrency(getTotalValue()) }}</h3>
            <p>Valor Total</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon low">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="card-content">
            <h3>{{ getLowStockCount() }}</h3>
            <p>Estoque Baixo</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon out">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="card-content">
            <h3>{{ getOutOfStockCount() }}</h3>
            <p>Sem Estoque</p>
          </div>
        </div>
      </div>

      <!-- Alerts Section -->
      <div class="alerts-section" *ngIf="alerts().length > 0">
        <h3>Alertas de Estoque</h3>
        <div class="alerts-list">
          <div 
            class="alert-item" 
            *ngFor="let alert of alerts()"
            [class]="'severity-' + alert.severity"
            [class.unread]="!alert.isRead"
          >
            <div class="alert-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="alert-content">
              <h4>{{ alert.productName }}</h4>
              <p>{{ alert.message }}</p>
              <span class="alert-date">{{ formatDate(alert.date) }}</span>
            </div>
            <button class="alert-action" (click)="markAlertAsRead(alert)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </button>
          </div>
        </div>
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
            (input)="filterInventory()"
          >
        </div>
        <select [(ngModel)]="categoryFilter" (change)="filterInventory()" class="category-filter">
          <option value="">Todas as Categorias</option>
          <option value="PIZZA">Pizza</option>
          <option value="BURGER">Hambúrguer</option>
          <option value="SUSHI">Sushi</option>
          <option value="BEVERAGE">Bebida</option>
          <option value="DESSERT">Sobremesa</option>
        </select>
        <select [(ngModel)]="statusFilter" (change)="filterInventory()" class="status-filter">
          <option value="">Todos os Status</option>
          <option value="in_stock">Em Estoque</option>
          <option value="low_stock">Estoque Baixo</option>
          <option value="out_of_stock">Sem Estoque</option>
          <option value="expired">Vencido</option>
        </select>
      </div>

      <!-- Inventory Table -->
      <div class="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Estoque Atual</th>
              <th>Estoque Mín/Máx</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
              <th>Fornecedor</th>
              <th>Localização</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredInventory()" [class]="'status-' + item.status">
              <td>
                <div class="product-info">
                  <strong>{{ item.productName }}</strong>
                  <small *ngIf="item.expirationDate">
                    Vence: {{ formatDate(item.expirationDate) }}
                  </small>
                </div>
              </td>
              <td>{{ getCategoryName(item.category) }}</td>
              <td>
                <div class="stock-info">
                  <span class="stock-number">{{ item.currentStock }}</span>
                  <div class="stock-bar">
                    <div 
                      class="stock-fill" 
                      [style.width.%]="getStockPercentage(item)"
                      [class]="getStockBarClass(item)"
                    ></div>
                  </div>
                </div>
              </td>
              <td>{{ item.minStock }} / {{ item.maxStock }}</td>
              <td>R$ {{ formatCurrency(item.unitCost) }}</td>
              <td>R$ {{ formatCurrency(item.totalValue) }}</td>
              <td>{{ item.supplier }}</td>
              <td>{{ item.location }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + item.status">
                  {{ getStatusName(item.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-primary" 
                    (click)="openRestockModal(item)"
                    title="Reabastecer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary" 
                    (click)="openMovementModal(item)"
                    title="Movimentar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
                    </svg>
                  </button>
                  <button 
                    class="btn btn-sm btn-info" 
                    (click)="viewMovementHistory(item)"
                    title="Histórico"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="filteredInventory().length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          </svg>
          <h3>Nenhum item encontrado</h3>
          <p>Não há itens que correspondam aos filtros selecionados.</p>
        </div>
      </div>
    </div>

    <!-- Restock Modal -->
    <div class="modal-overlay" *ngIf="showRestockModal" (click)="closeRestockModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedItem ? 'Reabastecer ' + selectedItem.productName : 'Reabastecer Produto' }}</h3>
          <button class="close-btn" (click)="closeRestockModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="restockForm" (ngSubmit)="processRestock()" class="modal-body">
          <div class="form-group" *ngIf="!selectedItem">
            <label for="product">Produto *</label>
            <select id="product" formControlName="productId" [class.error]="restockForm.get('productId')?.invalid && restockForm.get('productId')?.touched">
              <option value="">Selecione um produto</option>
              <option *ngFor="let item of inventory()" [value]="item.id">{{ item.productName }}</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="quantity">Quantidade *</label>
              <input 
                type="number" 
                id="quantity" 
                formControlName="quantity" 
                min="1"
                [class.error]="restockForm.get('quantity')?.invalid && restockForm.get('quantity')?.touched"
              >
            </div>

            <div class="form-group">
              <label for="unitCost">Custo Unitário *</label>
              <input 
                type="number" 
                id="unitCost" 
                formControlName="unitCost" 
                step="0.01" 
                min="0"
                [class.error]="restockForm.get('unitCost')?.invalid && restockForm.get('unitCost')?.touched"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="supplier">Fornecedor *</label>
              <input 
                type="text" 
                id="supplier" 
                formControlName="supplier"
                [class.error]="restockForm.get('supplier')?.invalid && restockForm.get('supplier')?.touched"
              >
            </div>

            <div class="form-group">
              <label for="expirationDate">Data de Validade</label>
              <input 
                type="date" 
                id="expirationDate" 
                formControlName="expirationDate"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Observações</label>
            <textarea id="notes" formControlName="notes" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeRestockModal()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="restockForm.invalid">
              Reabastecer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Movement Modal -->
    <div class="modal-overlay" *ngIf="showMovementModal" (click)="closeMovementModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Movimentação de Estoque</h3>
          <button class="close-btn" (click)="closeMovementModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="movementForm" (ngSubmit)="processMovement()" class="modal-body">
          <div class="form-group" *ngIf="!selectedItem">
            <label for="movementProduct">Produto *</label>
            <select id="movementProduct" formControlName="productId">
              <option value="">Selecione um produto</option>
              <option *ngFor="let item of inventory()" [value]="item.id">{{ item.productName }}</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="movementType">Tipo de Movimentação *</label>
              <select id="movementType" formControlName="type">
                <option value="in">Entrada</option>
                <option value="out">Saída</option>
                <option value="adjustment">Ajuste</option>
              </select>
            </div>

            <div class="form-group">
              <label for="movementQuantity">Quantidade *</label>
              <input 
                type="number" 
                id="movementQuantity" 
                formControlName="quantity" 
                min="1"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="reason">Motivo *</label>
            <input type="text" id="reason" formControlName="reason">
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeMovementModal()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="movementForm.invalid">
              Processar Movimentação
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .inventory-container {
      max-width: 1400px;
    }

    .inventory-header {
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

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .stock-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .overview-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .card-icon.total {
      background: #3b82f6;
    }

    .card-icon.value {
      background: #10b981;
    }

    .card-icon.low {
      background: #f59e0b;
    }

    .card-icon.out {
      background: #ef4444;
    }

    .card-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .card-content p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .alerts-section {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .alerts-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid;
    }

    .alert-item.severity-low {
      background: #fef3c7;
      border-color: #f59e0b;
    }

    .alert-item.severity-medium {
      background: #fed7aa;
      border-color: #ea580c;
    }

    .alert-item.severity-high {
      background: #fecaca;
      border-color: #dc2626;
    }

    .alert-item.severity-critical {
      background: #fde2e8;
      border-color: #be185d;
    }

    .alert-item.unread {
      font-weight: 600;
    }

    .alert-icon {
      color: #f59e0b;
    }

    .alert-content {
      flex: 1;
    }

    .alert-content h4 {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .alert-content p {
      font-size: 0.875rem;
      margin: 0 0 0.25rem 0;
    }

    .alert-date {
      font-size: 0.75rem;
      color: #64748b;
    }

    .alert-action {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: #64748b;
      transition: all 0.2s;
    }

    .alert-action:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #374151;
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

    .inventory-table {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }

    .product-info strong {
      display: block;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .product-info small {
      color: #64748b;
      font-size: 0.75rem;
    }

    .stock-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stock-number {
      font-weight: 600;
      color: #1e293b;
    }

    .stock-bar {
      width: 60px;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }

    .stock-fill {
      height: 100%;
      transition: width 0.3s;
    }

    .stock-fill.high {
      background: #10b981;
    }

    .stock-fill.medium {
      background: #f59e0b;
    }

    .stock-fill.low {
      background: #ef4444;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.status-in_stock {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.status-low_stock {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.status-out_of_stock {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.status-expired {
      background: #fde2e8;
      color: #be185d;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
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

    .btn-info {
      background: #0ea5e9;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #0284c7;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
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

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .inventory-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .stock-overview {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .search-box {
        min-width: auto;
      }

      .inventory-table {
        overflow-x: auto;
      }

      table {
        min-width: 800px;
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
export class AdminInventoryComponent implements OnInit {
  inventory = signal<InventoryItem[]>([]);
  filteredInventory = signal<InventoryItem[]>([]);
  alerts = signal<StockAlert[]>([]);
  movements = signal<StockMovement[]>([]);
  
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  
  showRestockModal = false;
  showMovementModal = false;
  selectedItem: InventoryItem | null = null;
  
  restockForm: FormGroup;
  movementForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.restockForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitCost: [0, [Validators.required, Validators.min(0.01)]],
      supplier: ['', Validators.required],
      expirationDate: [''],
      notes: ['']
    });

    this.movementForm = this.fb.group({
      productId: ['', Validators.required],
      type: ['out', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadInventory();
    this.loadAlerts();
  }

  private loadInventory() {
    // Mock data - em uma aplicação real, estes dados viriam de um serviço
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        productId: 'prod1',
        productName: 'Pizza Margherita',
        category: {
          id: 'PIZZA',
          name: 'Pizza',
          slug: 'pizza',
          isActive: true,
          sortOrder: 1
        },
        currentStock: 25,
        minStock: 10,
        maxStock: 50,
        unitCost: 18.50,
        totalValue: 462.50,
        supplier: 'Fornecedor A',
        lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Estoque Principal - A1',
        status: 'in_stock'
      },
      {
        id: '2',
        productId: 'prod2',
        productName: 'Hambúrguer Clássico',
        category: {
          id: 'BURGER',
          name: 'Hambúrguer',
          slug: 'burger',
          isActive: true,
          sortOrder: 2
        },
        currentStock: 8,
        minStock: 15,
        maxStock: 40,
        unitCost: 15.20,
        totalValue: 121.60,
        supplier: 'Fornecedor B',
        lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        location: 'Estoque Principal - B2',
        status: 'low_stock'
      },
      {
        id: '3',
        productId: 'prod3',
        productName: 'Sushi Combo',
        category: {
          id: 'SUSHI',
          name: 'Sushi',
          slug: 'sushi',
          isActive: true,
          sortOrder: 3
        },
        currentStock: 0,
        minStock: 5,
        maxStock: 20,
        unitCost: 28.30,
        totalValue: 0,
        supplier: 'Fornecedor C',
        lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        location: 'Estoque Principal - C1',
        status: 'out_of_stock'
      },
      {
        id: '4',
        productId: 'prod4',
        productName: 'Refrigerante Cola',
        category: {
          id: 'BEVERAGE',
          name: 'Bebida',
          slug: 'beverage',
          isActive: true,
          sortOrder: 4
        },
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        unitCost: 3.50,
        totalValue: 157.50,
        supplier: 'Fornecedor D',
        lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Estoque Bebidas - D1',
        status: 'in_stock'
      }
    ];

    this.inventory.set(mockInventory);
    this.filteredInventory.set(mockInventory);
  }

  private loadAlerts() {
    const mockAlerts: StockAlert[] = [
      {
        id: '1',
        productId: 'prod2',
        productName: 'Hambúrguer Clássico',
        type: 'low_stock',
        message: 'Estoque baixo: apenas 8 unidades restantes (mínimo: 15)',
        severity: 'medium',
        date: new Date(),
        isRead: false
      },
      {
        id: '2',
        productId: 'prod3',
        productName: 'Sushi Combo',
        type: 'out_of_stock',
        message: 'Produto sem estoque',
        severity: 'critical',
        date: new Date(),
        isRead: false
      },
      {
        id: '3',
        productId: 'prod1',
        productName: 'Pizza Margherita',
        type: 'expiring_soon',
        message: 'Produto vence em 7 dias',
        severity: 'low',
        date: new Date(),
        isRead: false
      }
    ];

    this.alerts.set(mockAlerts);
  }

  filterInventory() {
    let filtered = this.inventory();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(term) ||
        item.supplier.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(item => item.category.id === this.categoryFilter);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(item => item.status === this.statusFilter);
    }

    this.filteredInventory.set(filtered);
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

  getStatusName(status: string): string {
    const statusNames: { [key: string]: string } = {
      'in_stock': 'Em Estoque',
      'low_stock': 'Estoque Baixo',
      'out_of_stock': 'Sem Estoque',
      'expired': 'Vencido'
    };
    return statusNames[status] || status;
  }

  getStockPercentage(item: InventoryItem): number {
    return Math.min((item.currentStock / item.maxStock) * 100, 100);
  }

  getStockBarClass(item: InventoryItem): string {
    const percentage = this.getStockPercentage(item);
    if (percentage >= 50) return 'high';
    if (percentage >= 25) return 'medium';
    return 'low';
  }

  getTotalItems(): number {
    return this.inventory().reduce((total, item) => total + item.currentStock, 0);
  }

  getTotalValue(): number {
    return this.inventory().reduce((total, item) => total + item.totalValue, 0);
  }

  getLowStockCount(): number {
    return this.inventory().filter(item => item.status === 'low_stock').length;
  }

  getOutOfStockCount(): number {
    return this.inventory().filter(item => item.status === 'out_of_stock').length;
  }

  openRestockModal(item?: InventoryItem) {
    this.selectedItem = item || null;
    
    if (item) {
      this.restockForm.patchValue({
        productId: item.id,
        quantity: 0,
        unitCost: item.unitCost,
        supplier: item.supplier,
        expirationDate: '',
        notes: ''
      });
    } else {
      this.restockForm.reset({
        productId: '',
        quantity: 0,
        unitCost: 0,
        supplier: '',
        expirationDate: '',
        notes: ''
      });
    }

    this.showRestockModal = true;
  }

  closeRestockModal() {
    this.showRestockModal = false;
    this.selectedItem = null;
    this.restockForm.reset();
  }

  processRestock() {
    if (this.restockForm.valid) {
      const formValue = this.restockForm.value;
      const item = this.selectedItem || this.inventory().find(i => i.id === formValue.productId);
      
      if (item) {
        item.currentStock += formValue.quantity;
        item.unitCost = formValue.unitCost;
        item.totalValue = item.currentStock * item.unitCost;
        item.supplier = formValue.supplier;
        item.lastRestocked = new Date();
        
        if (formValue.expirationDate) {
          item.expirationDate = new Date(formValue.expirationDate);
        }

        // Atualizar status baseado no novo estoque
        if (item.currentStock >= item.minStock) {
          item.status = 'in_stock';
        } else if (item.currentStock > 0) {
          item.status = 'low_stock';
        } else {
          item.status = 'out_of_stock';
        }

        // Registrar movimento
        const movement: StockMovement = {
          id: Date.now().toString(),
          productId: item.productId,
          productName: item.productName,
          type: 'in',
          quantity: formValue.quantity,
          reason: `Reabastecimento - ${formValue.notes || 'Sem observações'}`,
          date: new Date(),
          user: 'Admin',
          cost: formValue.unitCost
        };

        this.movements.set([...this.movements(), movement]);
        
        console.log(`Produto ${item.productName} reabastecido com ${formValue.quantity} unidades`);
        this.closeRestockModal();
        this.filterInventory();
      }
    }
  }

  openMovementModal(item?: InventoryItem) {
    this.selectedItem = item || null;
    
    if (item) {
      this.movementForm.patchValue({
        productId: item.id,
        type: 'out',
        quantity: 1,
        reason: ''
      });
    } else {
      this.movementForm.reset({
        productId: '',
        type: 'out',
        quantity: 1,
        reason: ''
      });
    }

    this.showMovementModal = true;
  }

  closeMovementModal() {
    this.showMovementModal = false;
    this.selectedItem = null;
    this.movementForm.reset();
  }

  processMovement() {
    if (this.movementForm.valid) {
      const formValue = this.movementForm.value;
      const item = this.selectedItem || this.inventory().find(i => i.id === formValue.productId);
      
      if (item) {
        const oldStock = item.currentStock;
        
        switch (formValue.type) {
          case 'in':
            item.currentStock += formValue.quantity;
            break;
          case 'out':
            item.currentStock = Math.max(0, item.currentStock - formValue.quantity);
            break;
          case 'adjustment':
            item.currentStock = formValue.quantity;
            break;
        }

        item.totalValue = item.currentStock * item.unitCost;

        // Atualizar status
        if (item.currentStock >= item.minStock) {
          item.status = 'in_stock';
        } else if (item.currentStock > 0) {
          item.status = 'low_stock';
        } else {
          item.status = 'out_of_stock';
        }

        // Registrar movimento
        const movement: StockMovement = {
          id: Date.now().toString(),
          productId: item.productId,
          productName: item.productName,
          type: formValue.type,
          quantity: formValue.quantity,
          reason: formValue.reason,
          date: new Date(),
          user: 'Admin'
        };

        this.movements.set([...this.movements(), movement]);
        
        console.log(`Movimentação processada para ${item.productName}: ${oldStock} → ${item.currentStock}`);
        this.closeMovementModal();
        this.filterInventory();
      }
    }
  }

  viewMovementHistory(item: InventoryItem) {
    const itemMovements = this.movements().filter(m => m.productId === item.productId);
    console.log(`Histórico de movimentações para ${item.productName}:`, itemMovements);
    // Em uma aplicação real, isso abriria um modal com o histórico
  }

  markAlertAsRead(alert: StockAlert) {
    alert.isRead = true;
    console.log(`Alerta marcado como lido: ${alert.message}`);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}