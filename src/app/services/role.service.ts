import { Injectable, Inject, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getDummyUser());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private dataService: any;

  constructor(@Optional() @Inject('DataService') dataService?: any) {
    this.dataService = dataService;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
  }

  isTeamLeadOrHigher(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD]);
  }

  getAllUsers(): User[] {
    return [
      { id: 'user-1', name: 'John Admin', email: 'john.admin@company.com', role: UserRole.SUPER_ADMIN },
      { id: 'user-2', name: 'Sarah Manager', email: 'sarah.manager@company.com', role: UserRole.ORG_ADMIN },
      { id: 'user-3', name: 'Mike Lead', email: 'mike.lead@company.com', role: UserRole.TEAM_LEAD, teamId: 'team-1' },
      { id: 'user-4', name: 'Alice Sales', email: 'alice.sales@company.com', role: UserRole.SALES_EXECUTIVE, teamId: 'team-1', managerId: 'user-3' },
      { id: 'user-5', name: 'Bob Sales', email: 'bob.sales@company.com', role: UserRole.SALES_EXECUTIVE, teamId: 'team-1', managerId: 'user-3' },
      { id: 'user-6', name: 'Carol Sales', email: 'carol.sales@company.com', role: UserRole.SALES_EXECUTIVE, teamId: 'team-1', managerId: 'user-3' }
    ];
  }

  getViewableUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const allUsers = this.getAllUsers();
    if (this.isTeamLeadOrHigher()) {
      return allUsers.filter(u => u.role === UserRole.SALES_EXECUTIVE || u.id === currentUser.id);
    }
    return allUsers.filter(u => u.id === currentUser.id);
  }

  private getDummyUser(): User {
    return {
      id: 'user-4',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: UserRole.SALES_EXECUTIVE,
      teamId: 'team-1',
      managerId: 'user-3'
    };
  }
}
