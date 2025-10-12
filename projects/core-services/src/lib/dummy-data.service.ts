import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Generic data item interface
 */
export interface DataItem {
  id: string;
  [key: string]: any;
}

/**
 * Dummy data service
 * Provides dummy/mock data for testing and development purposes
 * Useful for prototyping and demos when backend APIs are not available
 * 
 * @Injectable providedIn: 'root' makes this service a singleton
 */
@Injectable({
  providedIn: 'root'
})
export class DummyDataService {
  constructor() {}

  /**
   * Generate dummy data with specified count
   * @param count - Number of items to generate
   * @param template - Template function to generate each item
   * @returns Array of generated items
   */
  generateData<T>(count: number, template: (index: number) => T): T[] {
    return Array.from({ length: count }, (_, i) => template(i));
  }

  /**
   * Get dummy data as an observable with simulated delay
   * @param data - Data to return
   * @param delayMs - Delay in milliseconds (default: 500)
   * @returns Observable of data
   */
  getData<T>(data: T, delayMs: number = 500): Observable<T> {
    return of(data).pipe(delay(delayMs));
  }

  /**
   * Generate dummy users
   * @param count - Number of users to generate
   * @returns Array of dummy users
   */
  generateUsers(count: number): any[] {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const domains = ['example.com', 'test.com', 'demo.com'];

    return this.generateData(count, (i) => {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      return {
        id: `user-${i + 1}`,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[i % domains.length]}`,
        phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      };
    });
  }

  /**
   * Generate dummy products
   * @param count - Number of products to generate
   * @returns Array of dummy products
   */
  generateProducts(count: number): any[] {
    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys'];
    const adjectives = ['Premium', 'Deluxe', 'Standard', 'Basic', 'Pro'];
    const nouns = ['Widget', 'Gadget', 'Device', 'Tool', 'Item'];

    return this.generateData(count, (i) => ({
      id: `prod-${i + 1}`,
      name: `${adjectives[i % adjectives.length]} ${nouns[Math.floor(i / adjectives.length) % nouns.length]}`,
      category: categories[i % categories.length],
      price: Math.round((10 + Math.random() * 990) * 100) / 100,
      inStock: Math.random() > 0.2,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    }));
  }

  /**
   * Generate dummy transactions
   * @param count - Number of transactions to generate
   * @returns Array of dummy transactions
   */
  generateTransactions(count: number): any[] {
    const statuses = ['completed', 'pending', 'failed', 'cancelled'];
    const types = ['purchase', 'refund', 'transfer'];

    return this.generateData(count, (i) => ({
      id: `txn-${i + 1}`,
      type: types[i % types.length],
      amount: Math.round((10 + Math.random() * 1000) * 100) / 100,
      status: statuses[i % statuses.length],
      userId: `user-${(i % 10) + 1}`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      description: `Transaction #${i + 1}`
    }));
  }

  /**
   * Generate a random string
   * @param length - Length of string to generate
   * @returns Random string
   */
  randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /**
   * Generate a random number within a range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Random number
   */
  randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random date within a range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Random date
   */
  randomDate(startDate: Date = new Date(2020, 0, 1), endDate: Date = new Date()): Date {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return new Date(start + Math.random() * (end - start));
  }
}
