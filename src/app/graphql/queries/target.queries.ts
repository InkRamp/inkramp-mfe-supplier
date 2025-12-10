/**
 * Target-related GraphQL Queries
 * Based on Sales Incentive Management System API Contracts
 */

export const TARGET_QUERIES = {
  /**
   * Get my targets
   */
  GET_MY_TARGETS: `
    query MyTargets {
      myTargets {
        id
        targetType
        targetValue
        currentValue
        period
        status
        startDate
        endDate
        progress
        createdBy
      }
    }
  `,

  /**
   * Get all targets (Admin/Lead only)
   */
  GET_ALL_TARGETS: `
    query AllTargets($brandId: String!, $userId: String) {
      targets(brandId: $brandId, userId: $userId) {
        id
        userId
        targetType
        targetValue
        currentValue
        period
        status
        startDate
        endDate
        progress
        createdBy
        user {
          userId
          name
          email
        }
      }
    }
  `
};

export const TARGET_MUTATIONS = {
  /**
   * Create a new target (Admin/Lead only)
   */
  CREATE_TARGET: `
    mutation CreateTarget($input: TargetInput!) {
      createTarget(input: $input) {
        id
        targetType
        targetValue
        currentValue
        period
        startDate
        endDate
        status
      }
    }
  `,

  /**
   * Update an existing target
   */
  UPDATE_TARGET: `
    mutation UpdateTarget($id: ID!, $input: TargetInput!) {
      updateTarget(id: $id, input: $input) {
        id
        targetValue
        currentValue
        status
        updatedAt
      }
    }
  `,

  /**
   * Delete a target
   */
  DELETE_TARGET: `
    mutation DeleteTarget($id: ID!) {
      deleteTarget(id: $id) {
        success
        message
      }
    }
  `
};
