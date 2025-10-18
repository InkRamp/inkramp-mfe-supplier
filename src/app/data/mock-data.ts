import { SalesStatus, ProductCategory, SalesRecord } from '@org/core-services';
import { User, UserRole } from '@org/core-services';

export interface MockDataSet {
  users: User[];
  salesRecords: SalesRecord[];
  products: ProductInfo[];
  clients: string[];
  regions: string[];
}

export interface ProductInfo {
  name: string;
  category: ProductCategory;
  basePrice: number;
}

const products: ProductInfo[] = [
  { name: 'Enterprise Software License', category: ProductCategory.SOFTWARE, basePrice: 50000 },
  { name: 'Cloud Storage Solution', category: ProductCategory.SERVICES, basePrice: 25000 },
  { name: 'Server Hardware', category: ProductCategory.HARDWARE, basePrice: 35000 },
  { name: 'IoT Device Package', category: ProductCategory.ELECTRONICS, basePrice: 15000 },
  { name: 'Consulting Services', category: ProductCategory.SERVICES, basePrice: 20000 },
  { name: 'Mobile App Development', category: ProductCategory.SOFTWARE, basePrice: 45000 },
  { name: 'Security Suite', category: ProductCategory.SOFTWARE, basePrice: 30000 },
  { name: 'Network Infrastructure', category: ProductCategory.HARDWARE, basePrice: 60000 }
];

const clients: string[] = [
  'Acme Corporation',
  'Tech Innovations Inc',
  'Global Solutions Ltd',
  'Digital Dynamics',
  'Future Systems',
  'Smart Technologies',
  'Enterprise Solutions',
  'Cloud Masters'
];

const regions: string[] = ['North', 'South', 'East', 'West', 'Central'];

function generateSalesRecords(): SalesRecord[] {
  const salesExecutives = [
    { id: 'user-4', name: 'Alice Sales' },
    { id: 'user-5', name: 'Bob Sales' },
    { id: 'user-6', name: 'Carol Sales' }
  ];

  const statuses = [
    SalesStatus.COMPLETED,
    SalesStatus.COMPLETED,
    SalesStatus.COMPLETED,
    SalesStatus.PENDING,
    SalesStatus.CANCELLED
  ];

  const records: SalesRecord[] = [];
  let idCounter = 1;

  for (let i = 0; i < 50; i++) {
    const exec = salesExecutives[i % salesExecutives.length];
    const product = products[Math.floor(Math.random() * products.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const amount = product.basePrice + (Math.random() * 10000 - 5000);
    const commission = amount * 0.05;

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));

    records.push({
      id: `sale-${idCounter++}`,
      salesExecutiveId: exec.id,
      salesExecutiveName: exec.name,
      productName: product.name,
      productCategory: product.category,
      amount: Math.round(amount),
      commission: Math.round(commission),
      status,
      date,
      clientName: client,
      region
    });
  }

  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const MOCK_DATA: MockDataSet = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: UserRole.SUPER_ADMIN
    },
    {
      id: 'user-2',
      name: 'Sarah Manager',
      email: 'sarah.manager@company.com',
      role: UserRole.ORG_ADMIN
    },
    {
      id: 'user-3',
      name: 'Mike Lead',
      email: 'mike.lead@company.com',
      role: UserRole.TEAM_LEAD,
      teamId: 'team-1'
    },
    {
      id: 'user-4',
      name: 'Alice Sales',
      email: 'alice.sales@company.com',
      role: UserRole.SALES_EXECUTIVE,
      teamId: 'team-1',
      managerId: 'user-3'
    },
    {
      id: 'user-5',
      name: 'Bob Sales',
      email: 'bob.sales@company.com',
      role: UserRole.SALES_EXECUTIVE,
      teamId: 'team-1',
      managerId: 'user-3'
    },
    {
      id: 'user-6',
      name: 'Carol Sales',
      email: 'carol.sales@company.com',
      role: UserRole.SALES_EXECUTIVE,
      teamId: 'team-1',
      managerId: 'user-3'
    }
  ],

  products,
  clients,
  regions,
  salesRecords: generateSalesRecords()
};
