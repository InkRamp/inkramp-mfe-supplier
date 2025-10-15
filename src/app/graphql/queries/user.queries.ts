export const USER_QUERIES = {
  GET_ALL_USERS: `
    query GetAllUsers {
      users {
        id
        name
        email
        role
        teamId
        managerId
      }
    }
  `,

  GET_CURRENT_USER: `
    query GetCurrentUser {
      currentUser {
        id
        name
        email
        role
        teamId
        managerId
      }
    }
  `,

  GET_VIEWABLE_USERS: `
    query GetViewableUsers($userId: ID!) {
      viewableUsers(userId: $userId) {
        id
        name
        email
        role
        teamId
        managerId
      }
    }
  `
};
