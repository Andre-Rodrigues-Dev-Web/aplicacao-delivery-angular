import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    options?: string[];
  }>;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  estimatedDelivery?: Date;
  notes?: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <div class="orders-header">
        <h2 class="page-title">Gestão de Pedidos</h2>
        <div class="header-actions">
          <div class="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar pedidos..." 
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
            >
          </div>
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="status-filter">
            <option value="">Todos os Status</option>
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Pronto</option>
            <option value="OUT_FOR_DELIVERY">Saiu para Entrega</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      <!-- Orders Stats -->
      <div class="orders-stats">
        <div class="stat-item">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ filteredOrders().length }}</span>
        </div>
        <div class="stat-item pending">
          <span class="stat-label">Pendentes</span>
          <span class="stat-value">{{ getOrdersByStatus('PENDING').length }}</span>
        </div>
        <div class="stat-item preparing">
          <span class="stat-label">Preparando</span>
          <span class="stat-value">{{ getOrdersByStatus('PREPARING').length }}</span>
        </div>
        <div class="stat-item ready">
          <span class="stat-label">Prontos</span>
          <span class="stat-value">{{ getOrdersByStatus('READY').length }}</span>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-list">
        <div class="order-card" *ngFor="let order of filteredOrders()">
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-id">Pedido #{{ order.id }}</h3>
              <p class="customer-name">{{ order.customerName }}</p>
              <p class="order-time">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status">
              <select 
                [(ngModel)]="order.status" 
                (change)="updateOrderStatus(order)"
                [class]="'status-select ' + order.status.toLowerCase()"
              >
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PREPARING">Preparando</option>
                <option value="READY">Pronto</option>
                <option value="OUT_FOR_DELIVERY">Saiu para Entrega</option>
                <option value="DELIVERED">Entregue</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="order-details">
            <div class="customer-details">
              <div class="detail-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{{ order.customerPhone }}</span>
              </div>
              <div class="detail-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ order.customerAddress }}</span>
              </div>
            </div>

            <div class="order-items">
              <h4 class="items-title">Itens do Pedido:</h4>
              <div class="items-list">
                <div class="item" *ngFor="let item of order.items">
                  <span class="item-name">{{ item.quantity }}x {{ item.name }}</span>
                  <span class="item-price">R$ {{ formatCurrency(item.price * item.quantity) }}</span>
                  <div class="item-options" *ngIf="item.options && item.options.length > 0">
                    <small>{{ item.options.join(', ') }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-total">
              <strong>Total: R$ {{ formatCurrency(order.total) }}</strong>
            </div>

            <div class="order-notes" *ngIf="order.notes">
              <h4 class="notes-title">Observações:</h4>
              <p>{{ order.notes }}</p>
            </div>
          </div>

          <div class="order-actions">
            <button class="btn btn-primary" (click)="viewOrderDetails(order)">
              Ver Detalhes
            </button>
            <button class="btn btn-secondary" (click)="printOrder(order)">
              Imprimir
            </button>
            <button 
              class="btn btn-danger" 
              (click)="cancelOrder(order)"
              [disabled]="order.status === 'DELIVERED' || order.status === 'CANCELLED'"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredOrders().length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          <h3>Nenhum pedido encontrado</h3>
          <p>Não há pedidos que correspondam aos filtros selecionados.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1200px;
    }

    .orders-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
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
      align-items: center;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box svg {
      position: absolute;
      left: 0.75rem;
      color: #64748b;
    }

    .search-box input {
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      width: 250px;
    }

    .status-filter {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: white;
    }

    .orders-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-item {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-item.pending {
      border-left: 4px solid #f59e0b;
    }

    .stat-item.preparing {
      border-left: 4px solid #3b82f6;
    }

    .stat-item.ready {
      border-left: 4px solid #10b981;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .order-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .customer-name {
      color: #64748b;
      margin: 0 0 0.25rem 0;
    }

    .order-time {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0;
    }

    .status-select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-select.pending {
      background: #fef3c7;
      color: #92400e;
      border-color: #f59e0b;
    }

    .status-select.confirmed {
      background: #dbeafe;
      color: #1e40af;
      border-color: #3b82f6;
    }

    .status-select.preparing {
      background: #dbeafe;
      color: #1e40af;
      border-color: #3b82f6;
    }

    .status-select.ready {
      background: #d1fae5;
      color: #065f46;
      border-color: #10b981;
    }

    .status-select.out_for_delivery {
      background: #e0e7ff;
      color: #3730a3;
      border-color: #6366f1;
    }

    .status-select.delivered {
      background: #d1fae5;
      color: #065f46;
      border-color: #10b981;
    }

    .status-select.cancelled {
      background: #fee2e2;
      color: #991b1b;
      border-color: #ef4444;
    }

    .order-details {
      padding: 1.5rem;
    }

    .customer-details {
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .detail-item svg {
      color: #94a3b8;
    }

    .items-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.75rem 0;
    }

    .items-list {
      margin-bottom: 1rem;
    }

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .item:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 500;
      color: #374151;
    }

    .item-price {
      font-weight: 600;
      color: #1e293b;
    }

    .item-options {
      grid-column: 1 / -1;
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .order-total {
      text-align: right;
      font-size: 1.125rem;
      color: #1e293b;
      margin-bottom: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .notes-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .order-notes p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 0.375rem;
    }

    .order-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    @media (max-width: 768px) {
      .orders-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        flex-direction: column;
      }

      .search-box input {
        width: 100%;
      }

      .order-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .order-actions {
        flex-direction: column;
      }

      .orders-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<AdminOrder[]>([]);
  searchTerm = '';
  statusFilter = '';

  filteredOrders = computed(() => {
    let filtered = this.orders();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders() {
    // Mock data - em uma aplicação real, estes dados viriam de um serviço
    const mockOrders: AdminOrder[] = [
      {
        id: '1234',
        customerName: 'João Silva',
        customerPhone: '(11) 99999-9999',
        customerAddress: 'Rua das Flores, 123 - Centro',
        items: [
          { name: 'Pizza Margherita', quantity: 1, price: 35.90, options: ['Borda recheada'] },
          { name: 'Refrigerante 2L', quantity: 1, price: 8.50 }
        ],
        total: 44.40,
        status: OrderStatus.PENDING,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        notes: 'Entregar no portão principal'
      },
      {
        id: '1235',
        customerName: 'Maria Santos',
        customerPhone: '(11) 88888-8888',
        customerAddress: 'Av. Paulista, 456 - Bela Vista',
        items: [
          { name: 'Hambúrguer Clássico', quantity: 2, price: 28.90 },
          { name: 'Batata Frita', quantity: 1, price: 12.90 }
        ],
        total: 70.70,
        status: OrderStatus.PREPARING,
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: '1236',
        customerName: 'Pedro Costa',
        customerPhone: '(11) 77777-7777',
        customerAddress: 'Rua Augusta, 789 - Consolação',
        items: [
          { name: 'Sushi Combo', quantity: 1, price: 45.90 }
        ],
        total: 45.90,
        status: OrderStatus.READY,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    this.orders.set(mockOrders);
  }

  onSearch() {
    // A filtragem é feita automaticamente pelo computed signal
  }

  onFilterChange() {
    // A filtragem é feita automaticamente pelo computed signal
  }

  getOrdersByStatus(status: string): AdminOrder[] {
    return this.orders().filter(order => order.status === status);
  }

  updateOrderStatus(order: AdminOrder) {
    console.log(`Atualizando status do pedido ${order.id} para ${order.status}`);
    // Em uma aplicação real, aqui seria feita a chamada para o serviço
  }

  viewOrderDetails(order: AdminOrder) {
    console.log('Visualizando detalhes do pedido:', order);
    // Implementar modal ou navegação para detalhes
  }

  printOrder(order: AdminOrder) {
    console.log('Imprimindo pedido:', order);
    // Implementar funcionalidade de impressão
  }

  cancelOrder(order: AdminOrder) {
    if (confirm(`Tem certeza que deseja cancelar o pedido #${order.id}?`)) {
      order.status = OrderStatus.CANCELLED;
      this.updateOrderStatus(order);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleString('pt-BR');
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}