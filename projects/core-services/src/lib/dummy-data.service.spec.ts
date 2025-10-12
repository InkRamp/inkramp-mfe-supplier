import { TestBed } from '@angular/core/testing';
import { DummyDataService } from './dummy-data.service';

describe('DummyDataService', () => {
  let service: DummyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DummyDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate data with template', () => {
    const data = service.generateData(5, (i) => ({ id: i, value: i * 2 }));
    
    expect(data.length).toBe(5);
    expect(data[0]).toEqual({ id: 0, value: 0 });
    expect(data[4]).toEqual({ id: 4, value: 8 });
  });

  it('should return data as observable with delay', (done) => {
    const testData = { message: 'Hello' };
    const startTime = Date.now();

    service.getData(testData, 100).subscribe(data => {
      const elapsed = Date.now() - startTime;
      expect(data).toEqual(testData);
      expect(elapsed).toBeGreaterThanOrEqual(100);
      done();
    });
  });

  it('should generate users', () => {
    const users = service.generateUsers(3);
    
    expect(users.length).toBe(3);
    expect(users[0].id).toBeDefined();
    expect(users[0].firstName).toBeDefined();
    expect(users[0].lastName).toBeDefined();
    expect(users[0].fullName).toBeDefined();
    expect(users[0].email).toBeDefined();
    expect(users[0].phone).toBeDefined();
    expect(users[0].createdAt).toBeDefined();
  });

  it('should generate products', () => {
    const products = service.generateProducts(3);
    
    expect(products.length).toBe(3);
    expect(products[0].id).toBeDefined();
    expect(products[0].name).toBeDefined();
    expect(products[0].category).toBeDefined();
    expect(products[0].price).toBeDefined();
    expect(products[0].inStock).toBeDefined();
    expect(products[0].rating).toBeDefined();
  });

  it('should generate transactions', () => {
    const transactions = service.generateTransactions(3);
    
    expect(transactions.length).toBe(3);
    expect(transactions[0].id).toBeDefined();
    expect(transactions[0].type).toBeDefined();
    expect(transactions[0].amount).toBeDefined();
    expect(transactions[0].status).toBeDefined();
    expect(transactions[0].userId).toBeDefined();
    expect(transactions[0].timestamp).toBeDefined();
  });

  it('should generate random string of specified length', () => {
    const str1 = service.randomString(10);
    const str2 = service.randomString(20);
    
    expect(str1.length).toBe(10);
    expect(str2.length).toBe(20);
    expect(str1).not.toBe(str2);
  });

  it('should generate random number within range', () => {
    const num = service.randomNumber(10, 20);
    
    expect(num).toBeGreaterThanOrEqual(10);
    expect(num).toBeLessThanOrEqual(20);
  });

  it('should generate random date within range', () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2020, 11, 31);
    const randomDate = service.randomDate(start, end);
    
    expect(randomDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(randomDate.getTime()).toBeLessThanOrEqual(end.getTime());
  });
});
