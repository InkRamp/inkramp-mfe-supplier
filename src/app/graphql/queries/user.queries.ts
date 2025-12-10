/**
 * User-related GraphQL Queries
 * Based on Sales Incentive Management System API Contracts
 */

export const USER_QUERIES = {
  /**
   * Get current authenticated user
   */
  GET_ME: `
    query Me {
      me {
        id
        userId
        email
        name
        role
        brandId
        org
        isActive
      }
    }
  `,

  /**
   * Get all users (Admin/Lead only)
   */
  GET_ALL_USERS: `
    query AllUsers($brandId: String!, $role: String) {
      users(brandId: $brandId, role: $role) {
        id
        userId
        email
        name
        role
        brandId
        isActive
        createdAt
        updatedAt
      }
    }
  `,

  /**
   * Legacy query for backward compatibility
   */
  GET_CURRENT_USER: `
    query GetCurrentUser {
      me {
        id
        userId
        name
        email
        role
        brandId
        org
      }
    }
  `,

  /**
   * Get viewable users (for team leads to view their team)
   */
  GET_VIEWABLE_USERS: `
    query GetViewableUsers($userId: ID!) {
      viewableUsers(userId: $userId) {
        id
        userId
        name
        email
        role
        brandId
      }
    }
  `
};
