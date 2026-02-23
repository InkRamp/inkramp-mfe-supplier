export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ORG_ADMIN = 'org-admin',
  TEAM_LEAD = 'team-lead',
  SALES_EXECUTIVE = 'sales-executive'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  managerId?: string;
}
