import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: ProductSales[];
  salesByCategory: CategorySales[];
  salesByHour: HourlySales[];
  salesByDay: DailySales[];
}

interface ProductSales {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

interface CategorySales {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
}

interface HourlySales {
  hour: number;
  orders: number;
  revenue: number;
}

interface DailySales {
  date: string;
  orders: number;
  revenue: number;
}

interface PerformanceMetrics {
  customerSatisfaction: number;
  averageDeliveryTime: number;
  orderFulfillmentRate: number;
  customerRetentionRate: number;
  newCustomersCount: number;
  returningCustomersCount: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="reports-header">
        <h2 class="page-title">Relatórios e Analytics</h2>
        <div class="header-controls">
          <select [(ngModel)]="selectedPeriod" (change)="loadReports()" class="period-selector">
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button class="btn btn-primary" (click)="exportReport()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-overview">
        <div class="metric-card revenue">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="metric-content">
            <h3>R$ {{ formatCurrency(salesReport().totalSales) }}</h3>
            <p>Receita Total</p>
            <span class="metric-change positive">+12.5%</span>
          </div>
        </div>

        <div class="metric-card orders">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            </svg>
          </div>
          <div class="metric-content">
            <h3>{{ salesReport().totalOrders }}</h3>
            <p>Total de Pedidos</p>
            <span class="metric-change positive">+8.3%</span>
          </div>
        </div>

        <div class="metric-card average">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <div class="metric-content">
            <h3>R$ {{ formatCurrency(salesReport().averageOrderValue) }}</h3>
            <p>Ticket Médio</p>
            <span class="metric-change positive">+5.7%</span>
          </div>
        </div>

        <div class="metric-card satisfaction">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="metric-content">
            <h3>{{ performanceMetrics().customerSatisfaction }}%</h3>
            <p>Satisfação do Cliente</p>
            <span class="metric-change positive">+2.1%</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Sales Trend Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Tendência de Vendas</h3>
            <div class="chart-controls">
              <button 
                class="chart-btn" 
                [class.active]="chartView === 'daily'"
                (click)="chartView = 'daily'"
              >
                Diário
              </button>
              <button 
                class="chart-btn" 
                [class.active]="chartView === 'hourly'"
                (click)="chartView = 'hourly'"
              >
                Por Hora
              </button>
            </div>
          </div>
          <div class="chart-content">
            <div class="chart-placeholder" *ngIf="chartView === 'daily'">
              <div class="chart-bars">
                <div 
                  class="chart-bar" 
                  *ngFor="let day of salesReport().salesByDay"
                  [style.height.%]="getBarHeight(day.revenue, getMaxDailyRevenue())"
                  [title]="day.date + ': R$ ' + formatCurrency(day.revenue)"
                >
                  <span class="bar-label">{{ formatShortDate(day.date) }}</span>
                </div>
              </div>
            </div>
            <div class="chart-placeholder" *ngIf="chartView === 'hourly'">
              <div class="chart-bars">
                <div 
                  class="chart-bar hourly" 
                  *ngFor="let hour of salesReport().salesByHour"
                  [style.height.%]="getBarHeight(hour.revenue, getMaxHourlyRevenue())"
                  [title]="hour.hour + 'h: R$ ' + formatCurrency(hour.revenue)"
                >
                  <span class="bar-label">{{ hour.hour }}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Vendas por Categoria</h3>
          </div>
          <div class="chart-content">
            <div class="category-chart">
              <div class="category-item" *ngFor="let category of salesReport().salesByCategory">
                <div class="category-info">
                  <span class="category-name">{{ category.category }}</span>
                  <span class="category-value">R$ {{ formatCurrency(category.revenue) }}</span>
                </div>
                <div class="category-bar">
                  <div 
                    class="category-fill" 
                    [style.width.%]="category.percentage"
                    [class]="'category-' + category.category.toLowerCase()"
                  ></div>
                </div>
                <span class="category-percentage">{{ category.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="products-section">
        <div class="section-header">
          <h3>Produtos Mais Vendidos</h3>
          <select [(ngModel)]="productSortBy" (change)="sortProducts()" class="sort-selector">
            <option value="quantity">Por Quantidade</option>
            <option value="revenue">Por Receita</option>
            <option value="profit">Por Lucro</option>
          </select>
        </div>
        <div class="products-table">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Qtd. Vendida</th>
                <th>Receita</th>
                <th>Lucro</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of sortedProducts(); let i = index" [class]="'rank-' + (i + 1)">
                <td>
                  <div class="product-info">
                    <span class="rank">#{{ i + 1 }}</span>
                    <strong>{{ product.productName }}</strong>
                  </div>
                </td>
                <td>{{ product.category }}</td>
                <td>{{ product.quantitySold }}</td>
                <td>R$ {{ formatCurrency(product.revenue) }}</td>
                <td>R$ {{ formatCurrency(product.profit) }}</td>
                <td>
                  <span class="profit-margin" [class]="getProfitMarginClass(product.profitMargin)">
                    {{ product.profitMargin.toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-section">
        <h3>Métricas de Performance</h3>
        <div class="performance-grid">
          <div class="performance-card">
            <div class="performance-header">
              <h4>Tempo Médio de Entrega</h4>
              <span class="performance-value">{{ performanceMetrics().averageDeliveryTime }} min</span>
            </div>
            <div class="performance-bar">
              <div 
                class="performance-fill delivery" 
                [style.width.%]="getDeliveryTimePercentage()"
              ></div>
            </div>
            <p class="performance-note">Meta: 30 min</p>
          </div>

          <div class="performance-card">
            <div class="performance-header">
              <h4>Taxa de Cumprimento</h4>
              <span class="performance-value">{{ performanceMetrics().orderFulfillmentRate }}%</span>
            </div>
            <div class="performance-bar">
              <div 
                class="performance-fill fulfillment" 
                [style.width.%]="performanceMetrics().orderFulfillmentRate"
              ></div>
            </div>
            <p class="performance-note">Meta: 95%</p>
          </div>

          <div class="performance-card">
            <div class="performance-header">
              <h4>Retenção de Clientes</h4>
              <span class="performance-value">{{ performanceMetrics().customerRetentionRate }}%</span>
            </div>
            <div class="performance-bar">
              <div 
                class="performance-fill retention" 
                [style.width.%]="performanceMetrics().customerRetentionRate"
              ></div>
            </div>
            <p class="performance-note">Meta: 70%</p>
          </div>
        </div>
      </div>

      <!-- Customer Analytics -->
      <div class="customer-section">
        <h3>Analytics de Clientes</h3>
        <div class="customer-stats">
          <div class="customer-stat">
            <div class="stat-icon new">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div class="stat-content">
              <h4>{{ performanceMetrics().newCustomersCount }}</h4>
              <p>Novos Clientes</p>
            </div>
          </div>

          <div class="customer-stat">
            <div class="stat-icon returning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M23 11l-3-3v2h-4v2h4v2l3-3z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h4>{{ performanceMetrics().returningCustomersCount }}</h4>
              <p>Clientes Recorrentes</p>
            </div>
          </div>

          <div class="customer-ratio">
            <h4>Proporção de Clientes</h4>
            <div class="ratio-bar">
              <div 
                class="ratio-new" 
                [style.width.%]="getNewCustomerPercentage()"
                [title]="'Novos: ' + getNewCustomerPercentage().toFixed(1) + '%'"
              ></div>
              <div 
                class="ratio-returning" 
                [style.width.%]="getReturningCustomerPercentage()"
                [title]="'Recorrentes: ' + getReturningCustomerPercentage().toFixed(1) + '%'"
              ></div>
            </div>
            <div class="ratio-legend">
              <span class="legend-item">
                <span class="legend-color new"></span>
                Novos ({{ getNewCustomerPercentage().toFixed(1) }}%)
              </span>
              <span class="legend-item">
                <span class="legend-color returning"></span>
                Recorrentes ({{ getReturningCustomerPercentage().toFixed(1) }}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      max-width: 1400px;
    }

    .reports-header {
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

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .period-selector {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: white;
    }

    .btn {
      padding: 0.75rem 1rem;
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

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    /* Metrics Overview */
    .metrics-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .metric-card.revenue .metric-icon {
      background: #10b981;
    }

    .metric-card.orders .metric-icon {
      background: #3b82f6;
    }

    .metric-card.average .metric-icon {
      background: #8b5cf6;
    }

    .metric-card.satisfaction .metric-icon {
      background: #f59e0b;
    }

    .metric-content {
      flex: 1;
    }

    .metric-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .metric-content p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .metric-change {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    .metric-change.positive {
      background: #d1fae5;
      color: #065f46;
    }

    .metric-change.negative {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .chart-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .chart-controls {
      display: flex;
      gap: 0.5rem;
    }

    .chart-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chart-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .chart-content {
      padding: 1.5rem;
    }

    .chart-bars {
      display: flex;
      align-items: end;
      gap: 0.5rem;
      height: 200px;
    }

    .chart-bar {
      flex: 1;
      background: #3b82f6;
      border-radius: 0.25rem 0.25rem 0 0;
      position: relative;
      min-height: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chart-bar:hover {
      background: #2563eb;
    }

    .chart-bar.hourly {
      max-width: 20px;
    }

    .bar-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: #64748b;
      white-space: nowrap;
    }

    .category-chart {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .category-info {
      min-width: 120px;
      display: flex;
      flex-direction: column;
    }

    .category-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
    }

    .category-value {
      font-size: 0.75rem;
      color: #64748b;
    }

    .category-bar {
      flex: 1;
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .category-fill {
      height: 100%;
      transition: width 0.3s;
    }

    .category-fill.category-pizza {
      background: #ef4444;
    }

    .category-fill.category-hambúrguer {
      background: #f59e0b;
    }

    .category-fill.category-sushi {
      background: #10b981;
    }

    .category-fill.category-bebida {
      background: #3b82f6;
    }

    .category-fill.category-sobremesa {
      background: #8b5cf6;
    }

    .category-percentage {
      font-size: 0.75rem;
      font-weight: 500;
      color: #374151;
      min-width: 40px;
      text-align: right;
    }

    /* Products Section */
    .products-section {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .sort-selector {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: white;
    }

    .products-table {
      overflow-x: auto;
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

    .product-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rank {
      background: #f1f5f9;
      color: #64748b;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .rank-1 .rank {
      background: #fef3c7;
      color: #92400e;
    }

    .rank-2 .rank {
      background: #e5e7eb;
      color: #374151;
    }

    .rank-3 .rank {
      background: #fed7aa;
      color: #ea580c;
    }

    .profit-margin {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .profit-margin.high {
      background: #d1fae5;
      color: #065f46;
    }

    .profit-margin.medium {
      background: #fef3c7;
      color: #92400e;
    }

    .profit-margin.low {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Performance Section */
    .performance-section {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .performance-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
    }

    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .performance-card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .performance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .performance-header h4 {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      margin: 0;
    }

    .performance-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }

    .performance-bar {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .performance-fill {
      height: 100%;
      transition: width 0.3s;
    }

    .performance-fill.delivery {
      background: #f59e0b;
    }

    .performance-fill.fulfillment {
      background: #10b981;
    }

    .performance-fill.retention {
      background: #3b82f6;
    }

    .performance-note {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }

    /* Customer Section */
    .customer-section {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }

    .customer-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
    }

    .customer-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .customer-stat {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon.new {
      background: #10b981;
    }

    .stat-icon.returning {
      background: #3b82f6;
    }

    .stat-content h4 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .stat-content p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .customer-ratio {
      grid-column: 1 / -1;
    }

    .customer-ratio h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
    }

    .ratio-bar {
      height: 12px;
      background: #f1f5f9;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      margin-bottom: 0.75rem;
    }

    .ratio-new {
      background: #10b981;
    }

    .ratio-returning {
      background: #3b82f6;
    }

    .ratio-legend {
      display: flex;
      gap: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.new {
      background: #10b981;
    }

    .legend-color.returning {
      background: #3b82f6;
    }

    @media (max-width: 768px) {
      .reports-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-controls {
        justify-content: center;
      }

      .metrics-overview {
        grid-template-columns: 1fr;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .performance-grid {
        grid-template-columns: 1fr;
      }

      .customer-stats {
        grid-template-columns: 1fr;
      }

      .chart-bars {
        height: 150px;
      }

      .products-table {
        overflow-x: auto;
      }

      table {
        min-width: 600px;
      }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  salesReport = signal<SalesReport>({
    period: 'month',
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByCategory: [],
    salesByHour: [],
    salesByDay: []
  });

  performanceMetrics = signal<PerformanceMetrics>({
    customerSatisfaction: 0,
    averageDeliveryTime: 0,
    orderFulfillmentRate: 0,
    customerRetentionRate: 0,
    newCustomersCount: 0,
    returningCustomersCount: 0
  });

  sortedProducts = signal<ProductSales[]>([]);
  
  selectedPeriod = 'month';
  chartView = 'daily';
  productSortBy = 'revenue';

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    // Mock data - em uma aplicação real, estes dados viriam de um serviço
    const mockSalesReport: SalesReport = {
      period: this.selectedPeriod,
      totalSales: 45680.50,
      totalOrders: 342,
      averageOrderValue: 133.57,
      topProducts: [
        {
          productId: '1',
          productName: 'Pizza Margherita',
          category: 'Pizza',
          quantitySold: 89,
          revenue: 1647.50,
          profit: 823.75,
          profitMargin: 50.0
        },
        {
          productId: '2',
          productName: 'Hambúrguer Clássico',
          category: 'Hambúrguer',
          quantitySold: 76,
          revenue: 1292.80,
          profit: 516.12,
          profitMargin: 39.9
        },
        {
          productId: '3',
          productName: 'Sushi Combo',
          category: 'Sushi',
          quantitySold: 45,
          revenue: 1273.50,
          profit: 509.40,
          profitMargin: 40.0
        },
        {
          productId: '4',
          productName: 'Refrigerante Cola',
          category: 'Bebida',
          quantitySold: 156,
          revenue: 546.00,
          profit: 273.00,
          profitMargin: 50.0
        },
        {
          productId: '5',
          productName: 'Brownie Chocolate',
          category: 'Sobremesa',
          quantitySold: 34,
          revenue: 408.00,
          profit: 163.20,
          profitMargin: 40.0
        }
      ],
      salesByCategory: [
        { category: 'Pizza', revenue: 18672.20, orders: 156, percentage: 40.9 },
        { category: 'Hambúrguer', revenue: 13704.40, orders: 98, percentage: 30.0 },
        { category: 'Sushi', revenue: 7384.60, orders: 52, percentage: 16.2 },
        { category: 'Bebida', revenue: 3651.80, orders: 89, percentage: 8.0 },
        { category: 'Sobremesa', revenue: 2267.50, orders: 47, percentage: 4.9 }
      ],
      salesByHour: [
        { hour: 11, orders: 12, revenue: 1596.84 },
        { hour: 12, orders: 28, revenue: 3739.96 },
        { hour: 13, orders: 24, revenue: 3205.68 },
        { hour: 18, orders: 35, revenue: 4674.95 },
        { hour: 19, orders: 42, revenue: 5609.94 },
        { hour: 20, orders: 38, revenue: 5075.66 },
        { hour: 21, orders: 29, revenue: 3873.13 },
        { hour: 22, orders: 18, revenue: 2404.26 }
      ],
      salesByDay: [
        { date: '2024-01-15', orders: 45, revenue: 6012.15 },
        { date: '2024-01-16', orders: 52, revenue: 6948.84 },
        { date: '2024-01-17', orders: 38, revenue: 5075.66 },
        { date: '2024-01-18', orders: 41, revenue: 5476.37 },
        { date: '2024-01-19', orders: 48, revenue: 6412.56 },
        { date: '2024-01-20', orders: 56, revenue: 7483.92 },
        { date: '2024-01-21', orders: 62, revenue: 8284.00 }
      ]
    };

    const mockPerformanceMetrics: PerformanceMetrics = {
      customerSatisfaction: 87.5,
      averageDeliveryTime: 28,
      orderFulfillmentRate: 96.8,
      customerRetentionRate: 73.2,
      newCustomersCount: 89,
      returningCustomersCount: 253
    };

    this.salesReport.set(mockSalesReport);
    this.performanceMetrics.set(mockPerformanceMetrics);
    this.sortProducts();
  }

  sortProducts() {
    const products = [...this.salesReport().topProducts];
    
    switch (this.productSortBy) {
      case 'quantity':
        products.sort((a, b) => b.quantitySold - a.quantitySold);
        break;
      case 'revenue':
        products.sort((a, b) => b.revenue - a.revenue);
        break;
      case 'profit':
        products.sort((a, b) => b.profit - a.profit);
        break;
    }

    this.sortedProducts.set(products);
  }

  getBarHeight(value: number, maxValue: number): number {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  getMaxDailyRevenue(): number {
    return Math.max(...this.salesReport().salesByDay.map(d => d.revenue));
  }

  getMaxHourlyRevenue(): number {
    return Math.max(...this.salesReport().salesByHour.map(h => h.revenue));
  }

  getProfitMarginClass(margin: number): string {
    if (margin >= 40) return 'high';
    if (margin >= 25) return 'medium';
    return 'low';
  }

  getDeliveryTimePercentage(): number {
    const target = 30;
    const actual = this.performanceMetrics().averageDeliveryTime;
    return Math.min((target / actual) * 100, 100);
  }

  getNewCustomerPercentage(): number {
    const total = this.performanceMetrics().newCustomersCount + this.performanceMetrics().returningCustomersCount;
    return total > 0 ? (this.performanceMetrics().newCustomersCount / total) * 100 : 0;
  }

  getReturningCustomerPercentage(): number {
    const total = this.performanceMetrics().newCustomersCount + this.performanceMetrics().returningCustomersCount;
    return total > 0 ? (this.performanceMetrics().returningCustomersCount / total) * 100 : 0;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  exportReport() {
    console.log('Exportando relatório para o período:', this.selectedPeriod);
    // Em uma aplicação real, isso geraria um PDF ou Excel
  }
}