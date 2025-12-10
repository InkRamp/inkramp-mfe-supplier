/**
 * Incentive-related GraphQL Queries
 * Based on Sales Incentive Management System API Contracts
 */

export const INCENTIVE_QUERIES = {
  /**
   * Get my incentives with optional filtering
   */
  GET_MY_INCENTIVES: `
    query MyIncentives($status: String, $limit: Int) {
      myIncentives(status: $status, limit: $limit) {
        id
        amount
        status
        earnedDate
        paidDate
        metadata
        rule {
          name
          description
          ruleType
          rewardAmount
          rewardPercentage
        }
      }
    }
  `,

  /**
   * Get incentive history for current user
   */
  GET_INCENTIVE_HISTORY: `
    query IncentiveHistory {
      incentiveHistory {
        id
        amount
        status
        earnedDate
        paidDate
        rule {
          name
          description
          ruleType
        }
      }
    }
  `,

  /**
   * Get all incentive rules (Admin/Lead only)
   */
  GET_INCENTIVE_RULES: `
    query AllIncentiveRules($brandId: String!) {
      incentiveRules(brandId: $brandId) {
        id
        name
        description
        ruleType
        rewardAmount
        rewardPercentage
        criteria
        isActive
        validFrom
        validTo
        createdBy
      }
    }
  `
};

export const INCENTIVE_MUTATIONS = {
  /**
   * Create a new incentive rule (Admin/Lead only)
   */
  CREATE_INCENTIVE_RULE: `
    mutation CreateIncentiveRule($input: IncentiveRuleInput!) {
      createIncentiveRule(input: $input) {
        id
        name
        description
        ruleType
        rewardAmount
        rewardPercentage
        isActive
        validFrom
        validTo
      }
    }
  `,

  /**
   * Update an existing incentive rule
   */
  UPDATE_INCENTIVE_RULE: `
    mutation UpdateIncentiveRule($id: ID!, $input: IncentiveRuleInput!) {
      updateIncentiveRule(id: $id, input: $input) {
        id
        name
        description
        ruleType
        isActive
        updatedAt
      }
    }
  `
};
