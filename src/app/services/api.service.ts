import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DATA_CONFIG } from '../config/data.config';
import {
  ApiResponse,
  User,
  Incentive,
  IncentiveRule,
  Target,
  Task,
  Organization,
  SeedDataResponse,
  IncentiveRuleInput,
  TargetInput,
  TaskUpdateInput
} from '../models/api-types';

/**
 * API Service for REST endpoints
 * Handles communication with DB Adaptor REST API
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = DATA_CONFIG.endpoints.dbAdaptor;

  constructor(private http: HttpClient) {}

  /**
   * Get headers with authentication token
   */
  private getHeaders(authToken?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }

    return headers;
  }

  // ============================================================================
  // Data Seeding
  // ============================================================================

  /**
   * Seed brand data (requires authentication)
   */
  seedBrandData(brandId: string, authToken: string): Observable<ApiResponse<SeedDataResponse>> {
    return this.http.post<ApiResponse<SeedDataResponse>>(
      `${this.baseUrl}/seed/${brandId}`,
      {},
      { headers: this.getHeaders(authToken) }
    );
  }

  /**
   * Clear brand data
   */
  clearBrandData(brandId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/data/${brandId}`
    );
  }

  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Get all users for a brand
   */
  getUsers(brandId: string, role?: string): Observable<ApiResponse<User[]>> {
    const params: any = {};
    if (role) params.role = role;

    return this.http.get<ApiResponse<User[]>>(
      `${this.baseUrl}/users/${brandId}`,
      { params }
    );
  }

  /**
   * Get user by ID
   */
  getUserById(brandId: string, userId: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      `${this.baseUrl}/users/${brandId}/${userId}`
    );
  }

  /**
   * Create a new user
   */
  createUser(brandId: string, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.baseUrl}/users/${brandId}`,
      user
    );
  }

  // ============================================================================
  // Incentive Rules
  // ============================================================================

  /**
   * Get all incentive rules
   */
  getIncentiveRules(brandId: string, activeOnly?: boolean): Observable<ApiResponse<IncentiveRule[]>> {
    const params: any = {};
    if (activeOnly !== undefined) params.active = activeOnly.toString();

    return this.http.get<ApiResponse<IncentiveRule[]>>(
      `${this.baseUrl}/incentive-rules/${brandId}`,
      { params }
    );
  }

  /**
   * Create incentive rule
   */
  createIncentiveRule(brandId: string, rule: IncentiveRuleInput): Observable<ApiResponse<IncentiveRule>> {
    return this.http.post<ApiResponse<IncentiveRule>>(
      `${this.baseUrl}/incentive-rules/${brandId}`,
      rule
    );
  }

  /**
   * Update incentive rule
   */
  updateIncentiveRule(brandId: string, ruleId: string, rule: Partial<IncentiveRuleInput>): Observable<ApiResponse<IncentiveRule>> {
    return this.http.put<ApiResponse<IncentiveRule>>(
      `${this.baseUrl}/incentive-rules/${brandId}/${ruleId}`,
      rule
    );
  }

  /**
   * Delete incentive rule
   */
  deleteIncentiveRule(brandId: string, ruleId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/incentive-rules/${brandId}/${ruleId}`
    );
  }

  // ============================================================================
  // Incentives
  // ============================================================================

  /**
   * Get incentives with filters
   */
  getIncentives(
    brandId: string,
    filters?: {
      userId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ApiResponse<Incentive[]>> {
    const params: any = {};
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    return this.http.get<ApiResponse<Incentive[]>>(
      `${this.baseUrl}/incentives/${brandId}`,
      { params }
    );
  }

  /**
   * Create incentive
   */
  createIncentive(brandId: string, incentive: Partial<Incentive>): Observable<ApiResponse<Incentive>> {
    return this.http.post<ApiResponse<Incentive>>(
      `${this.baseUrl}/incentives/${brandId}`,
      incentive
    );
  }

  /**
   * Update incentive
   */
  updateIncentive(brandId: string, incentiveId: string, incentive: Partial<Incentive>): Observable<ApiResponse<Incentive>> {
    return this.http.put<ApiResponse<Incentive>>(
      `${this.baseUrl}/incentives/${brandId}/${incentiveId}`,
      incentive
    );
  }

  // ============================================================================
  // Targets
  // ============================================================================

  /**
   * Get targets with filters
   */
  getTargets(
    brandId: string,
    filters?: {
      userId?: string;
      status?: string;
    }
  ): Observable<ApiResponse<Target[]>> {
    const params: any = {};
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.status) params.status = filters.status;

    return this.http.get<ApiResponse<Target[]>>(
      `${this.baseUrl}/targets/${brandId}`,
      { params }
    );
  }

  /**
   * Create target
   */
  createTarget(brandId: string, target: TargetInput): Observable<ApiResponse<Target>> {
    return this.http.post<ApiResponse<Target>>(
      `${this.baseUrl}/targets/${brandId}`,
      target
    );
  }

  /**
   * Update target
   */
  updateTarget(brandId: string, targetId: string, target: Partial<TargetInput>): Observable<ApiResponse<Target>> {
    return this.http.put<ApiResponse<Target>>(
      `${this.baseUrl}/targets/${brandId}/${targetId}`,
      target
    );
  }

  /**
   * Delete target
   */
  deleteTarget(brandId: string, targetId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/targets/${brandId}/${targetId}`
    );
  }

  // ============================================================================
  // Tasks
  // ============================================================================

  /**
   * Get tasks with filters
   */
  getTasks(
    brandId: string,
    filters?: {
      userId?: string;
      status?: string;
    }
  ): Observable<ApiResponse<Task[]>> {
    const params: any = {};
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.status) params.status = filters.status;

    return this.http.get<ApiResponse<Task[]>>(
      `${this.baseUrl}/tasks/${brandId}`,
      { params }
    );
  }

  /**
   * Create task
   */
  createTask(brandId: string, task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(
      `${this.baseUrl}/tasks/${brandId}`,
      task
    );
  }

  /**
   * Update task
   */
  updateTask(brandId: string, taskId: string, task: TaskUpdateInput): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(
      `${this.baseUrl}/tasks/${brandId}/${taskId}`,
      task
    );
  }

  /**
   * Delete task
   */
  deleteTask(brandId: string, taskId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/tasks/${brandId}/${taskId}`
    );
  }

  // ============================================================================
  // Organizations
  // ============================================================================

  /**
   * Get all organizations
   */
  getOrganizations(status?: string): Observable<ApiResponse<Organization[]>> {
    const params: any = {};
    if (status) params.status = status;

    return this.http.get<ApiResponse<Organization[]>>(
      `${this.baseUrl}/organizations`,
      { params }
    );
  }

  /**
   * Get organization by ID
   */
  getOrganizationById(orgId: string): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(
      `${this.baseUrl}/organizations/${orgId}`
    );
  }

  /**
   * Create organization
   */
  createOrganization(organization: Partial<Organization>): Observable<ApiResponse<Organization>> {
    return this.http.post<ApiResponse<Organization>>(
      `${this.baseUrl}/organizations`,
      organization
    );
  }
}
