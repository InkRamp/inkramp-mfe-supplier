export const SALES_QUERIES = {
  GET_SALES_HISTORY: `
    query GetSalesHistory($userId: ID!, $startDate: DateTime, $endDate: DateTime) {
      salesHistory(userId: $userId, startDate: $startDate, endDate: $endDate) {
        id
        salesExecutiveId
        salesExecutiveName
        productName
        productCategory
        amount
        commission
        status
        date
        clientName
        region
      }
    }
  `,

  GET_SALES_SUMMARY: `
    query GetSalesSummary($userId: ID!) {
      salesSummary(userId: $userId) {
        totalSales
        totalCommission
        completedCount
        pendingCount
        cancelledCount
      }
    }
  `,

  GET_ALL_SALES: `
    query GetAllSales {
      allSales {
        id
        salesExecutiveId
        salesExecutiveName
        productName
        productCategory
        amount
        commission
        status
        date
        clientName
        region
      }
    }
  `
};
