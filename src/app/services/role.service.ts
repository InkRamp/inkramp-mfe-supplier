import { Injectable, Inject, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserRole } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private allUsers: User[] = [];

  constructor(@Optional() @Inject('DataService') dataService?: any) {
    if (dataService) {
      dataService.getAllUsers().pipe(
        catchError(() => [])
      ).subscribe((users: User[]) => {
        this.allUsers = users;
      });
    }
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
    return this.allUsers;
  }

  getViewableUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    if (this.isTeamLeadOrHigher()) {
      return this.allUsers.filter(u => u.role === UserRole.SALES_EXECUTIVE || u.id === currentUser.id);
    }
    return this.allUsers.filter(u => u.id === currentUser.id);
  }
}
