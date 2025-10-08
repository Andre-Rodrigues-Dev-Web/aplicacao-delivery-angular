import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, CreateUserRequest } from '../models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { StorageService } from './storage.service';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  // Signals for reactive state management
  private authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Computed signals
  readonly user = computed(() => this.authState().user);
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly isLoading = computed(() => this.authState().isLoading);
  readonly error = computed(() => this.authState().error);
  readonly userRole = computed(() => this.authState().user?.role);

  // Role-based computed signals
  readonly isCustomer = computed(() => this.userRole() === UserRole.CUSTOMER);
  readonly isAdmin = computed(() => this.userRole() === UserRole.ADMIN);
  readonly isDeliverer = computed(() => this.userRole() === UserRole.DELIVERER);
  readonly isManager = computed(() => this.userRole() === UserRole.MANAGER);

  constructor(private storageService: StorageService) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.storageService.getItem(this.TOKEN_KEY);
    const userData = this.storageService.getItem(this.USER_KEY);

    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.updateAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.updateAuthState({ ...this.authState(), isLoading: true, error: null });

    // Mock implementation - replace with actual HTTP call
    return this.mockLogin(credentials).pipe(
      tap(response => {
        this.handleLoginSuccess(response);
      }),
      catchError(error => {
        this.updateAuthState({
          ...this.authState(),
          isLoading: false,
          error: error.message || 'Erro ao fazer login'
        });
        return throwError(() => error);
      })
    );
  }

  register(userData: CreateUserRequest): Observable<LoginResponse> {
    this.updateAuthState({ ...this.authState(), isLoading: true, error: null });

    // Mock implementation - replace with actual HTTP call
    return this.mockRegister(userData).pipe(
      tap(response => {
        this.handleLoginSuccess(response);
      }),
      catchError(error => {
        this.updateAuthState({
          ...this.authState(),
          isLoading: false,
          error: error.message || 'Erro ao criar conta'
        });
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    // Mock implementation - replace with actual HTTP call
    return this.mockRefreshToken(refreshToken).pipe(
      tap(response => {
        this.handleLoginSuccess(response);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  hasPermission(permission: string): boolean {
    const user = this.user();
    if (!user) return false;

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) return true;

    // Check specific permissions based on role
    const rolePermissions = this.getRolePermissions(user.role);
    return rolePermissions.includes(permission) || rolePermissions.includes('*');
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.userRole();
    return userRole ? roles.includes(userRole) : false;
  }

  private handleLoginSuccess(response: LoginResponse): void {
    // Store tokens and user data
    this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    this.storageService.setItem(this.USER_KEY, JSON.stringify(response.user));

    // Update auth state
    this.updateAuthState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  private clearAuthData(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
  }

  private updateAuthState(newState: AuthState): void {
    this.authState.set(newState);
  }

  private getRolePermissions(role: UserRole): string[] {
    // This would typically come from a configuration or API
    const permissions: Record<UserRole, string[]> = {
      [UserRole.CUSTOMER]: ['order:create', 'order:view_own', 'profile:update_own'],
      [UserRole.DELIVERER]: ['order:view_assigned', 'order:update_status'],
      [UserRole.MANAGER]: ['order:view_all', 'product:manage', 'report:view'],
      [UserRole.ADMIN]: ['*'],
      [UserRole.SUPPORT]: ['order:view_all', 'user:view']
    };

    return permissions[role] || [];
  }

  // Mock implementations - replace with actual HTTP calls
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        if (credentials.email === 'admin@delivery.com' && credentials.password === 'admin123') {
          const mockUser: User = {
            id: '1',
            email: credentials.email,
            name: 'Administrador',
            phone: '+55 11 99999-9999',
            role: UserRole.ADMIN,
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            addresses: [],
            preferences: {
              notifications: {
                email: true,
                sms: true,
                push: true,
                orderUpdates: true,
                promotions: false,
                newsletter: false
              },
              delivery: {},
              payment: {},
              dietary: {
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                lactoseFree: false,
                allergies: []
              }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };

          observer.next({
            user: mockUser,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          });
        } else if (credentials.email === 'andrelaurentinomg@gmail.com' && credentials.password === 'Andre1993@') {
          const mockUser: User = {
            id: '2',
            email: credentials.email,
            name: 'andre',
            phone: '+55 11 98765-4321',
            role: UserRole.ADMIN,
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            addresses: [],
            preferences: {
              notifications: {
                email: true,
                sms: true,
                push: true,
                orderUpdates: true,
                promotions: true,
                newsletter: true
              },
              delivery: {},
              payment: {},
              dietary: {
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                lactoseFree: false,
                allergies: []
              }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };

          observer.next({
            user: mockUser,
            accessToken: 'mock-access-token-andre',
            refreshToken: 'mock-refresh-token-andre',
            expiresIn: 3600
          });
        } else {
          observer.error(new Error('Credenciais inválidas'));
        }
        observer.complete();
      }, 1000);
    });
  }

  private mockRegister(userData: CreateUserRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role || UserRole.CUSTOMER,
          isActive: true,
          isEmailVerified: false,
          isPhoneVerified: false,
          addresses: [],
          preferences: {
            notifications: {
              email: true,
              sms: true,
              push: true,
              orderUpdates: true,
              promotions: true,
              newsletter: true
            },
            delivery: {},
            payment: {},
            dietary: {
              vegetarian: false,
              vegan: false,
              glutenFree: false,
              lactoseFree: false,
              allergies: []
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        observer.next({
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        });
        observer.complete();
      }, 1000);
    });
  }

  private mockRefreshToken(refreshToken: string): Observable<LoginResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentUser = this.user();
        if (currentUser) {
          observer.next({
            user: currentUser,
            accessToken: 'new-mock-access-token',
            refreshToken: 'new-mock-refresh-token',
            expiresIn: 3600
          });
        } else {
          observer.error(new Error('Invalid refresh token'));
        }
        observer.complete();
      }, 500);
    });
  }
}