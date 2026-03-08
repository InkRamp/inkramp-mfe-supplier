import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '@opensourcekd/ng-common-libs';
import { UserRole } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  getCurrentUser(): any {
    const raw = sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === UserRole.SUPER_ADMIN || role === UserRole.ORG_ADMIN;
  }

  isTeamLeadOrHigher(): boolean {
    const role = this.getRole();
    return role === UserRole.SUPER_ADMIN || role === UserRole.ORG_ADMIN || role === UserRole.TEAM_LEAD;
  }
}

