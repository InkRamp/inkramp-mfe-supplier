import { Injectable, Inject, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * User role types in the system
 * Privileges in descending order: super-admin > org-admin > team-lead > sales-executive
 */
export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ORG_ADMIN = 'org-admin',
  TEAM_LEAD = 'team-lead',
  SALES_EXECUTIVE = 'sales-executive'
}

/**
 * User interface representing a user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  managerId?: string;
}

/**
 * Stateless Role-based Access Control Service
 * 
 * This service is designed to work with API-driven authentication/authorization.
 * User information comes from API responses, not from local storage.
 * 
 * For debugging/testing in standalone mode:
 * - Temporarily holds user state in memory (BehaviorSubject)
 * - This state should be populated from API responses
 * - If no API, uses minimal dummy data only as fallback
 * 
 * @Injectable providedIn: 'root' makes this service a singleton
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // Temporary state for current user (should be populated from API)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  // All users list (should come from API)
  private allUsersSubject = new BehaviorSubject<User[]>([]);
  public allUsers$: Observable<User[]> = this.allUsersSubject.asObservable();
  
  private dataService: any;

  constructor(@Optional() @Inject('DataService') dataService?: any) {
    this.dataService = dataService;
    
    // For debugging in standalone mode without API, load minimal dummy data
    // In production, this should be removed and data should come from API
    if (!this.dataService) {
      console.warn('[RoleService] No DataService found. Using minimal dummy data for testing.');
      this.loadDummyDataForTesting();
    }
  }

  /**
   * Set the current user from API response
   * @param user - User to set as current
   */
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Get the current user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Set all users from API response
   * @param users - Array of all users
   */
  setAllUsers(users: User[]): void {
    this.allUsersSubject.next(users);
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  getAllUsers(): User[] {
    return this.allUsersSubject.value;
  }

  /**
   * Check if current user has a specific role
   * @param role - Role to check
   * @returns true if user has the specified role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if current user has any of the specified roles
   * @param roles - Array of roles to check
   * @returns true if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Check if current user is admin (super-admin or org-admin)
   * @returns true if user is an admin
   */
  isAdmin(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
  }

  /**
   * Check if current user is team lead or higher
   * @returns true if user is team lead or admin
   */
  isTeamLeadOrHigher(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD]);
  }

  /**
   * Get users that current user can view
   * - Admins and team leads can view all users
   * - Sales executives can only view themselves
   * @returns Array of users that current user can view
   */
  getViewableUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const allUsers = this.getAllUsers();

    if (this.isTeamLeadOrHigher()) {
      return allUsers.filter(u => u.role === UserRole.SALES_EXECUTIVE || u.id === currentUser.id);
    }

    return allUsers.filter(u => u.id === currentUser.id);
  }

  /**
   * Load minimal dummy data for testing in standalone mode
   * This should be removed in production - data should come from API
   */
  private loadDummyDataForTesting(): void {
    const dummyUsers: User[] = [
      {
        id: 'user-1',
        name: 'John Admin',
        email: 'john.admin@company.com',
        role: UserRole.SUPER_ADMIN
      },
      {
        id: 'user-2',
        name: 'Sarah Manager',
        email: 'sarah.manager@company.com',
        role: UserRole.ORG_ADMIN
      },
      {
        id: 'user-3',
        name: 'Mike Lead',
        email: 'mike.lead@company.com',
        role: UserRole.TEAM_LEAD,
        teamId: 'team-1'
      },
      {
        id: 'user-4',
        name: 'Alice Sales',
        email: 'alice.sales@company.com',
        role: UserRole.SALES_EXECUTIVE,
        teamId: 'team-1',
        managerId: 'user-3'
      },
      {
        id: 'user-5',
        name: 'Bob Sales',
        email: 'bob.sales@company.com',
        role: UserRole.SALES_EXECUTIVE,
        teamId: 'team-1',
        managerId: 'user-3'
      },
      {
        id: 'user-6',
        name: 'Carol Sales',
        email: 'carol.sales@company.com',
        role: UserRole.SALES_EXECUTIVE,
        teamId: 'team-1',
        managerId: 'user-3'
      }
    ];

    this.setAllUsers(dummyUsers);
    // Default to a sales executive for testing
    this.setCurrentUser(dummyUsers[3]); // Alice Sales
  }
}
