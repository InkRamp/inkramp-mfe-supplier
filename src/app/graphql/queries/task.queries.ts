/**
 * Task-related GraphQL Queries
 * Based on Sales Incentive Management System API Contracts
 */

export const TASK_QUERIES = {
  /**
   * Get my tasks with optional status filter
   */
  GET_MY_TASKS: `
    query MyTasks($status: String) {
      myTasks(status: $status) {
        id
        title
        description
        status
        priority
        dueDate
        createdAt
        updatedAt
      }
    }
  `,

  /**
   * Get all tasks (Admin/Lead only)
   */
  GET_ALL_TASKS: `
    query AllTasks($brandId: String!, $userId: String) {
      tasks(brandId: $brandId, userId: $userId) {
        id
        title
        description
        status
        priority
        dueDate
        createdAt
        user {
          userId
          name
          email
        }
      }
    }
  `
};

export const TASK_MUTATIONS = {
  /**
   * Update a task
   */
  UPDATE_TASK: `
    mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
      updateTask(id: $id, input: $input) {
        id
        title
        description
        status
        priority
        dueDate
        updatedAt
      }
    }
  `,

  /**
   * Create a new task
   */
  CREATE_TASK: `
    mutation CreateTask($input: TaskInput!) {
      createTask(input: $input) {
        id
        title
        description
        status
        priority
        dueDate
      }
    }
  `,

  /**
   * Delete a task
   */
  DELETE_TASK: `
    mutation DeleteTask($id: ID!) {
      deleteTask(id: $id) {
        success
        message
      }
    }
  `
};
