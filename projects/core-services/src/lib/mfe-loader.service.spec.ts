import { TestBed } from '@angular/core/testing';
import { MfeLoaderService, MfeConfig } from './mfe-loader.service';

describe('MfeLoaderService', () => {
  let service: MfeLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MfeLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load a remote module', (done) => {
    const config: MfeConfig = {
      remoteEntry: 'http://localhost:4101/remoteEntry.js',
      exposedModule: './Component',
      displayName: 'Test MFE'
    };

    service.loadRemoteModule(config).subscribe(module => {
      expect(module).toBeTruthy();
      expect(module.loaded).toBe(true);
      done();
    });
  });

  it('should cache loaded modules', (done) => {
    const config: MfeConfig = {
      remoteEntry: 'http://localhost:4101/remoteEntry.js',
      exposedModule: './Component',
      displayName: 'Test MFE'
    };

    service.loadRemoteModule(config).subscribe(() => {
      expect(service.isLoaded(config.remoteEntry)).toBe(true);
      
      const cachedModule = service.getLoadedModule(config.remoteEntry);
      expect(cachedModule).toBeTruthy();
      done();
    });
  });

  it('should return cached module on second load', (done) => {
    const config: MfeConfig = {
      remoteEntry: 'http://localhost:4102/remoteEntry.js',
      exposedModule: './Component',
      displayName: 'Test MFE 2'
    };

    service.loadRemoteModule(config).subscribe(firstLoad => {
      service.loadRemoteModule(config).subscribe(secondLoad => {
        expect(firstLoad).toBe(secondLoad);
        done();
      });
    });
  });

  it('should preload multiple modules', (done) => {
    const configs: MfeConfig[] = [
      {
        remoteEntry: 'http://localhost:4101/remoteEntry.js',
        exposedModule: './Component',
        displayName: 'MFE 1'
      },
      {
        remoteEntry: 'http://localhost:4102/remoteEntry.js',
        exposedModule: './Component',
        displayName: 'MFE 2'
      }
    ];

    service.preloadModules(configs).subscribe(modules => {
      expect(modules.length).toBe(2);
      expect(service.isLoaded(configs[0].remoteEntry)).toBe(true);
      expect(service.isLoaded(configs[1].remoteEntry)).toBe(true);
      done();
    });
  });

  it('should clear cache for specific entry', (done) => {
    const config: MfeConfig = {
      remoteEntry: 'http://localhost:4103/remoteEntry.js',
      exposedModule: './Component',
      displayName: 'Test MFE 3'
    };

    service.loadRemoteModule(config).subscribe(() => {
      expect(service.isLoaded(config.remoteEntry)).toBe(true);
      
      service.clearCache(config.remoteEntry);
      expect(service.isLoaded(config.remoteEntry)).toBe(false);
      done();
    });
  });

  it('should clear all cache', (done) => {
    const configs: MfeConfig[] = [
      {
        remoteEntry: 'http://localhost:4104/remoteEntry.js',
        exposedModule: './Component',
        displayName: 'MFE 4'
      },
      {
        remoteEntry: 'http://localhost:4105/remoteEntry.js',
        exposedModule: './Component',
        displayName: 'MFE 5'
      }
    ];

    service.preloadModules(configs).subscribe(() => {
      expect(service.isLoaded(configs[0].remoteEntry)).toBe(true);
      expect(service.isLoaded(configs[1].remoteEntry)).toBe(true);
      
      service.clearCache();
      expect(service.isLoaded(configs[0].remoteEntry)).toBe(false);
      expect(service.isLoaded(configs[1].remoteEntry)).toBe(false);
      done();
    });
  });
});
