# Core Services Library - Service Usage Examples

This document provides examples of how to use the services in the `@org/core-services` library.

## EventBusService

The EventBusService provides a global event bus for communication between components and MFEs.

### Basic Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { EventBusService } from '@org/core-services';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent implements OnInit {
  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Subscribe to specific event
    this.eventBus.on('user-logged-in').subscribe(event => {
      console.log('User logged in:', event.payload);
    });

    // Subscribe to event and get only payload
    this.eventBus.onPayload<{userId: string}>('user-selected').subscribe(payload => {
      console.log('User ID:', payload.userId);
    });
  }

  emitEvent() {
    // Emit an event
    this.eventBus.emit('user-action', { action: 'click', timestamp: Date.now() });
  }
}
```

### Cross-MFE Communication

```typescript
// In MFE 1 - Emit event
this.eventBus.emit('data-updated', { entityId: '123', type: 'sales' });

// In MFE 2 - Listen for event
this.eventBus.on('data-updated').subscribe(event => {
  if (event.payload.type === 'sales') {
    this.refreshData();
  }
});
```

## MfeLoaderService

The MfeLoaderService handles dynamic loading of micro-frontends using Module Federation.

### Loading a Remote MFE

```typescript
import { Component } from '@angular/core';
import { MfeLoaderService, MfeConfig } from '@org/core-services';

@Component({
  selector: 'app-shell',
  template: '...'
})
export class ShellComponent {
  constructor(private mfeLoader: MfeLoaderService) {}

  loadSalesMFE() {
    const config: MfeConfig = {
      remoteEntry: 'https://example.com/mfe-sales/remoteEntry.js',
      exposedModule: './Component',
      displayName: 'Sales Dashboard',
      routePath: '/sales',
      roles: ['sales-executive', 'admin']
    };

    this.mfeLoader.loadRemoteModule(config).subscribe(
      module => {
        console.log('MFE loaded successfully:', module);
      },
      error => {
        console.error('Failed to load MFE:', error);
      }
    );
  }

  preloadMFEs() {
    const configs: MfeConfig[] = [
      {
        remoteEntry: 'https://example.com/mfe-sales/remoteEntry.js',
        exposedModule: './Component',
        displayName: 'Sales'
      },
      {
        remoteEntry: 'https://example.com/mfe-reports/remoteEntry.js',
        exposedModule: './Component',
        displayName: 'Reports'
      }
    ];

    this.mfeLoader.preloadModules(configs).subscribe(
      modules => {
        console.log('All MFEs preloaded:', modules);
      }
    );
  }
}
```

### Checking if MFE is Loaded

```typescript
if (this.mfeLoader.isLoaded('https://example.com/mfe-sales/remoteEntry.js')) {
  const module = this.mfeLoader.getLoadedModule('https://example.com/mfe-sales/remoteEntry.js');
  // Use the cached module
}
```

## DummyDataService

The DummyDataService provides utilities for generating mock/dummy data for testing and development.

### Generating Custom Data

```typescript
import { Component, OnInit } from '@angular/core';
import { DummyDataService } from '@org/core-services';

@Component({
  selector: 'app-demo',
  template: '...'
})
export class DemoComponent implements OnInit {
  users: any[] = [];
  products: any[] = [];

  constructor(private dummyData: DummyDataService) {}

  ngOnInit() {
    // Generate 10 dummy users
    this.users = this.dummyData.generateUsers(10);

    // Generate 20 dummy products
    this.products = this.dummyData.generateProducts(20);

    // Generate custom data
    const customData = this.dummyData.generateData(5, (i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 100
    }));
  }

  loadDataWithDelay() {
    const mockData = { message: 'Hello World' };
    
    // Get data as observable with simulated delay
    this.dummyData.getData(mockData, 1000).subscribe(data => {
      console.log('Data received:', data);
    });
  }

  generateRandomValues() {
    // Generate random string
    const randomId = this.dummyData.randomString(16);
    
    // Generate random number between 1 and 100
    const randomScore = this.dummyData.randomNumber(1, 100);
    
    // Generate random date between two dates
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2024, 0, 1);
    const randomDate = this.dummyData.randomDate(startDate, endDate);
    
    console.log({ randomId, randomScore, randomDate });
  }
}
```

### Using with RxJS

```typescript
import { Component, OnInit } from '@angular/core';
import { DummyDataService } from '@org/core-services';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-async-demo',
  template: '...'
})
export class AsyncDemoComponent implements OnInit {
  constructor(private dummyData: DummyDataService) {}

  ngOnInit() {
    // Simulate async data fetching
    const users = this.dummyData.generateUsers(5);
    
    this.dummyData.getData(users, 500)
      .pipe(
        switchMap(users => {
          // After users are loaded, load products
          const products = this.dummyData.generateProducts(3);
          return this.dummyData.getData(products, 300);
        })
      )
      .subscribe(products => {
        console.log('Products loaded after users:', products);
      });
  }
}
```

## Combined Usage Example

Here's an example combining multiple services:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  EventBusService, 
  MfeLoaderService, 
  DummyDataService,
  MfeConfig 
} from '@org/core-services';

@Component({
  selector: 'app-dashboard',
  template: '...'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  mfes: any[] = [];

  constructor(
    private eventBus: EventBusService,
    private mfeLoader: MfeLoaderService,
    private dummyData: DummyDataService
  ) {}

  ngOnInit() {
    // Listen for events from other MFEs
    this.eventBus.on('mfe-loaded')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('MFE loaded:', event.payload);
        this.loadMfeData(event.payload.name);
      });

    // Generate dummy MFE configurations for demo
    this.mfes = this.dummyData.generateData(3, (i) => ({
      id: `mfe-${i}`,
      name: `MFE ${i}`,
      url: `https://example.com/mfe-${i}/remoteEntry.js`
    }));

    // Preload MFEs
    this.preloadMFEs();
  }

  preloadMFEs() {
    const configs: MfeConfig[] = this.mfes.map(mfe => ({
      remoteEntry: mfe.url,
      exposedModule: './Component',
      displayName: mfe.name
    }));

    this.mfeLoader.preloadModules(configs).subscribe(
      modules => {
        // Emit event when all MFEs are loaded
        this.eventBus.emit('all-mfes-loaded', { count: modules.length });
      }
    );
  }

  loadMfeData(mfeName: string) {
    // Simulate loading data for an MFE
    const data = this.dummyData.generateData(10, (i) => ({
      id: i,
      mfe: mfeName,
      value: this.dummyData.randomNumber(1, 100)
    }));

    this.dummyData.getData(data, 500).subscribe(result => {
      console.log(`Data for ${mfeName}:`, result);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Testing with Services

### Testing with EventBusService

```typescript
import { TestBed } from '@angular/core/testing';
import { EventBusService } from '@org/core-services';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventBusService]
    });
    
    eventBus = TestBed.inject(EventBusService);
    component = new MyComponent(eventBus);
  });

  it('should emit event on action', () => {
    spyOn(eventBus, 'emit');
    
    component.performAction();
    
    expect(eventBus.emit).toHaveBeenCalledWith('action-performed', jasmine.any(Object));
  });
});
```

### Testing with DummyDataService

```typescript
import { TestBed } from '@angular/core/testing';
import { DummyDataService } from '@org/core-services';
import { MyDataComponent } from './my-data.component';

describe('MyDataComponent', () => {
  let component: MyDataComponent;
  let dummyData: DummyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DummyDataService]
    });
    
    dummyData = TestBed.inject(DummyDataService);
    component = new MyDataComponent(dummyData);
  });

  it('should generate test data', () => {
    const users = dummyData.generateUsers(5);
    
    expect(users.length).toBe(5);
    expect(users[0]).toHaveProperty('id');
  });
});
```

## Best Practices

1. **EventBusService**: Always unsubscribe from event listeners in `ngOnDestroy` to prevent memory leaks
2. **MfeLoaderService**: Check if an MFE is already loaded before attempting to load it again
3. **DummyDataService**: Use this service only for development and testing; replace with real APIs in production
4. **Singleton Services**: All services are provided at root level, ensuring they are singletons across the application
5. **Type Safety**: Use TypeScript interfaces and generics when working with these services for better type safety

