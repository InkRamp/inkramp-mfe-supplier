import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * MFE configuration interface
 */
export interface MfeConfig {
  remoteEntry: string;
  exposedModule: string;
  displayName: string;
  routePath?: string;
  icon?: string;
  roles?: string[];
}

/**
 * MFE loader service
 * Handles dynamic loading of micro-frontends using Module Federation
 * Provides utilities for loading remote modules at runtime
 * 
 * @Injectable providedIn: 'root' makes this service a singleton
 */
@Injectable({
  providedIn: 'root'
})
export class MfeLoaderService {
  private loadedMfes: Map<string, any> = new Map();

  constructor() {}

  /**
   * Load a remote MFE module
   * @param config - MFE configuration
   * @returns Observable of loaded module
   */
  loadRemoteModule(config: MfeConfig): Observable<any> {
    // Check if already loaded
    if (this.loadedMfes.has(config.remoteEntry)) {
      return of(this.loadedMfes.get(config.remoteEntry));
    }

    // In a real implementation, this would use Module Federation's loadRemoteModule
    // For now, we'll return a placeholder
    return from(this.dynamicLoad(config)).pipe(
      map(module => {
        this.loadedMfes.set(config.remoteEntry, module);
        return module;
      }),
      catchError(error => {
        console.error(`Failed to load MFE from ${config.remoteEntry}:`, error);
        throw error;
      })
    );
  }

  /**
   * Check if an MFE is already loaded
   * @param remoteEntry - Remote entry URL
   * @returns true if MFE is loaded
   */
  isLoaded(remoteEntry: string): boolean {
    return this.loadedMfes.has(remoteEntry);
  }

  /**
   * Get a loaded MFE module
   * @param remoteEntry - Remote entry URL
   * @returns Loaded module or undefined
   */
  getLoadedModule(remoteEntry: string): any {
    return this.loadedMfes.get(remoteEntry);
  }

  /**
   * Preload multiple MFEs
   * @param configs - Array of MFE configurations
   * @returns Observable of load results
   */
  preloadModules(configs: MfeConfig[]): Observable<any[]> {
    const loadPromises = configs.map(config => 
      this.loadRemoteModule(config).toPromise()
    );
    return from(Promise.all(loadPromises));
  }

  /**
   * Clear loaded MFE cache
   * @param remoteEntry - Optional specific remote entry to clear, or all if not specified
   */
  clearCache(remoteEntry?: string): void {
    if (remoteEntry) {
      this.loadedMfes.delete(remoteEntry);
    } else {
      this.loadedMfes.clear();
    }
  }

  /**
   * Dynamic load implementation
   * This is a placeholder that would use Module Federation in production
   * @param config - MFE configuration
   * @returns Promise of loaded module
   */
  private async dynamicLoad(config: MfeConfig): Promise<any> {
    // In production, this would use:
    // import('@angular-architects/module-federation').then(mf =>
    //   mf.loadRemoteModule({
    //     type: 'module',
    //     remoteEntry: config.remoteEntry,
    //     exposedModule: config.exposedModule
    //   })
    // );
    
    // For now, return a mock module
    return Promise.resolve({
      config,
      loaded: true,
      timestamp: new Date()
    });
  }
}
