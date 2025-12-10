/**
 * API Types and Interfaces
 * Based on Sales Incentive Management System API Contracts
 */

// ============================================================================
// User Types
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  LEAD = 'LEAD',
  SALES_EXECUTIVE = 'SALES_EXECUTIVE'
}

export interface User {
  _id?: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  brandId: string;
  org?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Incentive Types
// ============================================================================

export enum IncentiveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID'
}

export enum RuleType {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE = 'PERCENTAGE'
}

export interface IncentiveRule {
  _id?: string;
  brandId: string;
  name: string;
  description: string;
  ruleType: RuleType;
  criteria: string;
  rewardAmount?: number;
  rewardPercentage?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Incentive {
  _id?: string;
  id?: string;
  brandId: string;
  userId: string;
  ruleId: string;
  amount: number;
  status: IncentiveStatus;
  earnedDate: string;
  paidDate?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  rule?: IncentiveRule;
}

// ============================================================================
// Target Types
// ============================================================================

export enum TargetType {
  REVENUE = 'REVENUE',
  UNITS = 'UNITS'
}

export enum TargetStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TargetPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export interface Target {
  _id?: string;
  id?: string;
  brandId: string;
  userId: string;
  targetType: TargetType;
  targetValue: number;
  currentValue: number;
  period: TargetPeriod;
  startDate: string;
  endDate: string;
  status: TargetStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
}

// ============================================================================
// Task Types
// ============================================================================

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Task {
  _id?: string;
  id?: string;
  brandId: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization {
  _id?: string;
  organizationId: string;
  name: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  errors?: Record<string, string>;
}

export interface SeedDataResponse {
  brandId: string;
  authenticatedUser: {
    userId: string;
    email: string;
    role: string;
  };
  summary: {
    users: number;
    rules: number;
    targets: number;
    incentives: number;
    tasks: number;
  };
  message: string;
}

// ============================================================================
// GraphQL Response Types
// ============================================================================

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: {
      code: string;
    };
  }>;
}

// ============================================================================
// Input Types for Mutations
// ============================================================================

export interface IncentiveRuleInput {
  brandId: string;
  name: string;
  description: string;
  ruleType: RuleType;
  criteria: string;
  rewardAmount?: number;
  rewardPercentage?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface TargetInput {
  brandId: string;
  userId: string;
  targetType: TargetType;
  targetValue: number;
  currentValue: number;
  period: TargetPeriod;
  startDate: string;
  endDate: string;
  status: TargetStatus;
  createdBy: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
