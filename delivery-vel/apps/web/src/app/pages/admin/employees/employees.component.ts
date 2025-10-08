import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRole } from '@delivery-vel/data';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  position: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  permissions: Permission[];
  lastLogin?: Date;
  avatar?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'orders' | 'products' | 'inventory' | 'reports' | 'employees' | 'settings';
  enabled: boolean;
}

interface Department {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="employees-container">
      <div class="employees-header">
        <h2 class="page-title">Gestão de Funcionários</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="openDepartmentModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Departamentos
          </button>
          <button class="btn btn-primary" (click)="openEmployeeModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Adicionar Funcionário
          </button>
        </div>
      </div>

      <!-- Employee Stats -->
      <div class="employee-stats">
        <div class="stat-card">
          <div class="stat-icon active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveEmployeesCount() }}</h3>
            <p>Funcionários Ativos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon departments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ departments().length }}</h3>
            <p>Departamentos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon roles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ getUniqueRolesCount() }}</h3>
            <p>Cargos Diferentes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon leave">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ getOnLeaveCount() }}</h3>
            <p>Em Licença</p>
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
            placeholder="Buscar funcionários..." 
            [(ngModel)]="searchTerm"
            (input)="filterEmployees()"
          >
        </div>
        <select [(ngModel)]="departmentFilter" (change)="filterEmployees()" class="department-filter">
          <option value="">Todos os Departamentos</option>
          <option *ngFor="let dept of departments()" [value]="dept.name">{{ dept.name }}</option>
        </select>
        <select [(ngModel)]="roleFilter" (change)="filterEmployees()" class="role-filter">
          <option value="">Todos os Cargos</option>
          <option value="ADMIN">Administrador</option>
          <option value="MANAGER">Gerente</option>
          <option value="EMPLOYEE">Funcionário</option>
          <option value="CUSTOMER">Cliente</option>
        </select>
        <select [(ngModel)]="statusFilter" (change)="filterEmployees()" class="status-filter">
          <option value="">Todos os Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="on_leave">Em Licença</option>
        </select>
      </div>

      <!-- Employees Grid -->
      <div class="employees-grid">
        <div class="employee-card" *ngFor="let employee of filteredEmployees()">
          <div class="employee-header">
            <div class="employee-avatar">
              <img *ngIf="employee.avatar" [src]="employee.avatar" [alt]="employee.name">
              <div *ngIf="!employee.avatar" class="avatar-placeholder">
                {{ getInitials(employee.name) }}
              </div>
            </div>
            <div class="employee-info">
              <h3>{{ employee.name }}</h3>
              <p>{{ employee.position }}</p>
              <span class="department">{{ employee.department }}</span>
            </div>
            <div class="employee-status">
              <span class="status-badge" [class]="'status-' + employee.status">
                {{ getStatusName(employee.status) }}
              </span>
            </div>
          </div>

          <div class="employee-details">
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>{{ employee.email }}</span>
            </div>
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>{{ employee.phone }}</span>
            </div>
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Admitido em {{ formatDate(employee.hireDate) }}</span>
            </div>
            <div class="detail-item" *ngIf="employee.lastLogin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10,17 15,12 10,7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Último acesso: {{ formatDate(employee.lastLogin) }}</span>
            </div>
          </div>

          <div class="employee-role">
            <span class="role-badge" [class]="'role-' + employee.role.toLowerCase()">
              {{ getRoleName(employee.role) }}
            </span>
            <span class="permissions-count">
              {{ getActivePermissionsCount(employee) }} permissões
            </span>
          </div>

          <div class="employee-actions">
            <button class="btn btn-sm btn-secondary" (click)="editEmployee(employee)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Editar
            </button>
            <button class="btn btn-sm btn-info" (click)="managePermissions(employee)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Permissões
            </button>
            <button 
              class="btn btn-sm" 
              [class]="employee.status === 'active' ? 'btn-warning' : 'btn-success'"
              (click)="toggleEmployeeStatus(employee)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15" *ngIf="employee.status === 'active'"></line>
                <line x1="9" y1="9" x2="15" y2="15" *ngIf="employee.status === 'active'"></line>
                <polyline points="9,11 12,14 22,4" *ngIf="employee.status !== 'active'"></polyline>
              </svg>
              {{ employee.status === 'active' ? 'Desativar' : 'Ativar' }}
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredEmployees().length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>Nenhum funcionário encontrado</h3>
          <p>Não há funcionários que correspondam aos filtros selecionados.</p>
        </div>
      </div>
    </div>

    <!-- Employee Modal -->
    <div class="modal-overlay" *ngIf="showEmployeeModal" (click)="closeEmployeeModal()">
      <div class="modal large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedEmployee ? 'Editar Funcionário' : 'Adicionar Funcionário' }}</h3>
          <button class="close-btn" (click)="closeEmployeeModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="employeeForm" (ngSubmit)="saveEmployee()" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nome Completo *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name"
                [class.error]="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched"
              >
            </div>

            <div class="form-group">
              <label for="email">E-mail *</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email"
                [class.error]="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Telefone *</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone"
                [class.error]="employeeForm.get('phone')?.invalid && employeeForm.get('phone')?.touched"
              >
            </div>

            <div class="form-group">
              <label for="role">Cargo *</label>
              <select 
                id="role" 
                formControlName="role"
                [class.error]="employeeForm.get('role')?.invalid && employeeForm.get('role')?.touched"
              >
                <option value="">Selecione um cargo</option>
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="EMPLOYEE">Funcionário</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="department">Departamento *</label>
              <select 
                id="department" 
                formControlName="department"
                [class.error]="employeeForm.get('department')?.invalid && employeeForm.get('department')?.touched"
              >
                <option value="">Selecione um departamento</option>
                <option *ngFor="let dept of departments()" [value]="dept.name">{{ dept.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="position">Posição *</label>
              <input 
                type="text" 
                id="position" 
                formControlName="position"
                [class.error]="employeeForm.get('position')?.invalid && employeeForm.get('position')?.touched"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="hireDate">Data de Admissão *</label>
              <input 
                type="date" 
                id="hireDate" 
                formControlName="hireDate"
                [class.error]="employeeForm.get('hireDate')?.invalid && employeeForm.get('hireDate')?.touched"
              >
            </div>

            <div class="form-group">
              <label for="status">Status *</label>
              <select 
                id="status" 
                formControlName="status"
                [class.error]="employeeForm.get('status')?.invalid && employeeForm.get('status')?.touched"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="on_leave">Em Licença</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeEmployeeModal()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="employeeForm.invalid">
              {{ selectedEmployee ? 'Atualizar' : 'Adicionar' }} Funcionário
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Permissions Modal -->
    <div class="modal-overlay" *ngIf="showPermissionsModal" (click)="closePermissionsModal()">
      <div class="modal large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Gerenciar Permissões - {{ selectedEmployee?.name }}</h3>
          <button class="close-btn" (click)="closePermissionsModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="permissions-grid">
            <div class="permission-category" *ngFor="let category of getPermissionCategories()">
              <h4>{{ getCategoryName(category) }}</h4>
              <div class="permission-list">
                <div 
                  class="permission-item" 
                  *ngFor="let permission of getPermissionsByCategory(category)"
                >
                  <div class="permission-info">
                    <label [for]="'perm-' + permission.id">{{ permission.name }}</label>
                    <p>{{ permission.description }}</p>
                  </div>
                  <div class="permission-toggle">
                    <input 
                      type="checkbox" 
                      [id]="'perm-' + permission.id"
                      [(ngModel)]="permission.enabled"
                      class="toggle-checkbox"
                    >
                    <label [for]="'perm-' + permission.id" class="toggle-label"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closePermissionsModal()">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" (click)="savePermissions()">
              Salvar Permissões
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employees-container {
      max-width: 1400px;
    }

    .employees-header {
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

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background: #d97706;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    /* Employee Stats */
    .employee-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

    .stat-icon.active {
      background: #10b981;
    }

    .stat-icon.departments {
      background: #3b82f6;
    }

    .stat-icon.roles {
      background: #8b5cf6;
    }

    .stat-icon.leave {
      background: #f59e0b;
    }

    .stat-content h3 {
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

    /* Filters */
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

    .department-filter,
    .role-filter,
    .status-filter {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: white;
      min-width: 150px;
    }

    /* Employees Grid */
    .employees-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .employee-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.2s;
    }

    .employee-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .employee-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .employee-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .employee-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #6b7280;
      font-size: 1.25rem;
    }

    .employee-info {
      flex: 1;
    }

    .employee-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .employee-info p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.25rem 0;
    }

    .department {
      font-size: 0.75rem;
      color: #6b7280;
      background: #f1f5f9;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.status-on_leave {
      background: #fef3c7;
      color: #92400e;
    }

    .employee-details {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .detail-item svg {
      color: #9ca3af;
    }

    .employee-role {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.5rem 1rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .role-badge.role-admin {
      background: #fde2e8;
      color: #be185d;
    }

    .role-badge.role-manager {
      background: #e0e7ff;
      color: #3730a3;
    }

    .role-badge.role-employee {
      background: #d1fae5;
      color: #065f46;
    }

    .permissions-count {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .employee-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .empty-state {
      grid-column: 1 / -1;
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

    .modal.large {
      max-width: 800px;
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
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input.error,
    .form-group select.error {
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

    /* Permissions Modal */
    .permissions-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .permission-category h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .permission-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .permission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
    }

    .permission-info {
      flex: 1;
    }

    .permission-info label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
      cursor: pointer;
    }

    .permission-info p {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }

    .permission-toggle {
      position: relative;
    }

    .toggle-checkbox {
      display: none;
    }

    .toggle-label {
      display: block;
      width: 44px;
      height: 24px;
      background: #d1d5db;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .toggle-label::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .toggle-checkbox:checked + .toggle-label {
      background: #3b82f6;
    }

    .toggle-checkbox:checked + .toggle-label::after {
      transform: translateX(20px);
    }

    @media (max-width: 768px) {
      .employees-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .employee-stats {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .search-box {
        min-width: auto;
      }

      .employees-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column;
      }

      .employee-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class AdminEmployeesComponent implements OnInit {
  employees = signal<Employee[]>([]);
  filteredEmployees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  availablePermissions = signal<Permission[]>([]);
  
  searchTerm = '';
  departmentFilter = '';
  roleFilter = '';
  statusFilter = '';
  
  showEmployeeModal = false;
  showPermissionsModal = false;
  selectedEmployee: Employee | null = null;
  
  employeeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required],
      hireDate: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadPermissions();
  }

  private loadEmployees() {
    // Mock data - em uma aplicação real, estes dados viriam de um serviço
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'André Laurentino',
        email: 'andrelaurentinomg@gmail.com',
        phone: '(31) 99999-9999',
        role: UserRole.ADMIN,
        department: 'Administração',
        position: 'Administrador do Sistema',
        hireDate: new Date('2023-01-15'),
        status: 'active',
        permissions: [],
        lastLogin: new Date()
      },
      {
        id: '2',
        name: 'Maria Silva',
        email: 'maria.silva@delivery.com',
        phone: '(31) 98888-8888',
        role: UserRole.MANAGER,
        department: 'Operações',
        position: 'Gerente de Operações',
        hireDate: new Date('2023-03-20'),
        status: 'active',
        permissions: [],
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'João Santos',
        email: 'joao.santos@delivery.com',
        phone: '(31) 97777-7777',
        role: UserRole.EMPLOYEE,
        department: 'Cozinha',
        position: 'Chef de Cozinha',
        hireDate: new Date('2023-05-10'),
        status: 'active',
        permissions: []
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa@delivery.com',
        phone: '(31) 96666-6666',
        role: UserRole.EMPLOYEE,
        department: 'Atendimento',
        position: 'Atendente',
        hireDate: new Date('2023-07-01'),
        status: 'on_leave',
        permissions: []
      }
    ];

    this.employees.set(mockEmployees);
    this.filteredEmployees.set(mockEmployees);
  }

  private loadDepartments() {
    const mockDepartments: Department[] = [
      { id: '1', name: 'Administração', description: 'Gestão geral da empresa' },
      { id: '2', name: 'Operações', description: 'Operações e logística' },
      { id: '3', name: 'Cozinha', description: 'Preparo dos alimentos' },
      { id: '4', name: 'Atendimento', description: 'Atendimento ao cliente' },
      { id: '5', name: 'Entrega', description: 'Entregadores e logística' }
    ];

    this.departments.set(mockDepartments);
  }

  private loadPermissions() {
    const mockPermissions: Permission[] = [
      // Orders permissions
      { id: '1', name: 'Visualizar Pedidos', description: 'Ver lista de pedidos', category: 'orders', enabled: false },
      { id: '2', name: 'Editar Pedidos', description: 'Modificar status e detalhes dos pedidos', category: 'orders', enabled: false },
      { id: '3', name: 'Cancelar Pedidos', description: 'Cancelar pedidos de clientes', category: 'orders', enabled: false },
      
      // Products permissions
      { id: '4', name: 'Visualizar Produtos', description: 'Ver catálogo de produtos', category: 'products', enabled: false },
      { id: '5', name: 'Criar Produtos', description: 'Adicionar novos produtos', category: 'products', enabled: false },
      { id: '6', name: 'Editar Produtos', description: 'Modificar produtos existentes', category: 'products', enabled: false },
      { id: '7', name: 'Excluir Produtos', description: 'Remover produtos do catálogo', category: 'products', enabled: false },
      
      // Inventory permissions
      { id: '8', name: 'Visualizar Estoque', description: 'Ver níveis de estoque', category: 'inventory', enabled: false },
      { id: '9', name: 'Gerenciar Estoque', description: 'Adicionar/remover itens do estoque', category: 'inventory', enabled: false },
      { id: '10', name: 'Relatórios de Estoque', description: 'Gerar relatórios de inventário', category: 'inventory', enabled: false },
      
      // Reports permissions
      { id: '11', name: 'Visualizar Relatórios', description: 'Ver relatórios básicos', category: 'reports', enabled: false },
      { id: '12', name: 'Relatórios Avançados', description: 'Acessar relatórios detalhados', category: 'reports', enabled: false },
      { id: '13', name: 'Exportar Relatórios', description: 'Exportar dados em PDF/Excel', category: 'reports', enabled: false },
      
      // Employees permissions
      { id: '14', name: 'Visualizar Funcionários', description: 'Ver lista de funcionários', category: 'employees', enabled: false },
      { id: '15', name: 'Gerenciar Funcionários', description: 'Adicionar/editar funcionários', category: 'employees', enabled: false },
      { id: '16', name: 'Gerenciar Permissões', description: 'Definir permissões de usuários', category: 'employees', enabled: false },
      
      // Settings permissions
      { id: '17', name: 'Configurações Básicas', description: 'Alterar configurações gerais', category: 'settings', enabled: false },
      { id: '18', name: 'Configurações Avançadas', description: 'Acessar configurações do sistema', category: 'settings', enabled: false }
    ];

    this.availablePermissions.set(mockPermissions);
  }

  filterEmployees() {
    let filtered = this.employees();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term)
      );
    }

    if (this.departmentFilter) {
      filtered = filtered.filter(emp => emp.department === this.departmentFilter);
    }

    if (this.roleFilter) {
      filtered = filtered.filter(emp => emp.role === this.roleFilter);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(emp => emp.status === this.statusFilter);
    }

    this.filteredEmployees.set(filtered);
  }

  getActiveEmployeesCount(): number {
    return this.employees().filter(emp => emp.status === 'active').length;
  }

  getUniqueRolesCount(): number {
    const roles = new Set(this.employees().map(emp => emp.role));
    return roles.size;
  }

  getOnLeaveCount(): number {
    return this.employees().filter(emp => emp.status === 'on_leave').length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusName(status: string): string {
    const statusNames = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'on_leave': 'Em Licença'
    };
    return statusNames[status] || status;
  }

  getRoleName(role: UserRole): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.MANAGER]: 'Gerente',
      [UserRole.EMPLOYEE]: 'Funcionário',
      [UserRole.CUSTOMER]: 'Cliente'
    };
    return roleNames[role] || role;
  }

  getActivePermissionsCount(employee: Employee): number {
    return employee.permissions.filter(p => p.enabled).length;
  }

  openEmployeeModal(employee?: Employee) {
    this.selectedEmployee = employee || null;
    
    if (employee) {
      this.employeeForm.patchValue({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        position: employee.position,
        hireDate: employee.hireDate.toISOString().split('T')[0],
        status: employee.status
      });
    } else {
      this.employeeForm.reset({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        position: '',
        hireDate: '',
        status: 'active'
      });
    }

    this.showEmployeeModal = true;
  }

  closeEmployeeModal() {
    this.showEmployeeModal = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
  }

  saveEmployee() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      
      if (this.selectedEmployee) {
        // Update existing employee
        Object.assign(this.selectedEmployee, {
          ...formValue,
          hireDate: new Date(formValue.hireDate)
        });
        console.log('Funcionário atualizado:', this.selectedEmployee.name);
      } else {
        // Create new employee
        const newEmployee: Employee = {
          id: Date.now().toString(),
          ...formValue,
          hireDate: new Date(formValue.hireDate),
          permissions: [...this.availablePermissions().map(p => ({ ...p, enabled: false }))]
        };
        
        this.employees.set([...this.employees(), newEmployee]);
        console.log('Novo funcionário adicionado:', newEmployee.name);
      }

      this.closeEmployeeModal();
      this.filterEmployees();
    }
  }

  editEmployee(employee: Employee) {
    this.openEmployeeModal(employee);
  }

  toggleEmployeeStatus(employee: Employee) {
    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    console.log(`Status do funcionário ${employee.name} alterado para: ${employee.status}`);
  }

  managePermissions(employee: Employee) {
    this.selectedEmployee = employee;
    // Clone permissions to avoid direct mutation
    employee.permissions = employee.permissions.length > 0 
      ? employee.permissions 
      : this.availablePermissions().map(p => ({ ...p, enabled: false }));
    
    this.showPermissionsModal = true;
  }

  closePermissionsModal() {
    this.showPermissionsModal = false;
    this.selectedEmployee = null;
  }

  savePermissions() {
    if (this.selectedEmployee) {
      console.log(`Permissões atualizadas para ${this.selectedEmployee.name}`);
      this.closePermissionsModal();
    }
  }

  getPermissionCategories(): string[] {
    return ['orders', 'products', 'inventory', 'reports', 'employees', 'settings'];
  }

  getCategoryName(category: string): string {
    const categoryNames = {
      'orders': 'Pedidos',
      'products': 'Produtos',
      'inventory': 'Estoque',
      'reports': 'Relatórios',
      'employees': 'Funcionários',
      'settings': 'Configurações'
    };
    return categoryNames[category] || category;
  }

  getPermissionsByCategory(category: string): Permission[] {
    if (!this.selectedEmployee) return [];
    return this.selectedEmployee.permissions.filter(p => p.category === category);
  }

  openDepartmentModal() {
    console.log('Abrindo modal de departamentos');
    // Em uma aplicação real, isso abriria um modal para gerenciar departamentos
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}