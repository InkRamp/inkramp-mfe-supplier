import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Event bus event interface
 */
export interface BusEvent {
  type: string;
  payload?: any;
}

/**
 * Event bus service
 * Provides a global event bus for communication between components and MFEs
 * Useful for cross-MFE communication in a micro-frontend architecture
 * 
 * @Injectable providedIn: 'root' makes this service a singleton
 */
@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<BusEvent>();

  constructor() {}

  /**
   * Emit an event to the event bus
   * @param type - Event type identifier
   * @param payload - Optional event payload
   */
  emit(type: string, payload?: any): void {
    this.eventSubject.next({ type, payload });
  }

  /**
   * Subscribe to all events on the event bus
   * @returns Observable of all events
   */
  on(): Observable<BusEvent>;
  
  /**
   * Subscribe to specific event types on the event bus
   * @param eventType - Event type to filter for
   * @returns Observable of filtered events
   */
  on(eventType: string): Observable<BusEvent>;
  
  on(eventType?: string): Observable<BusEvent> {
    if (eventType) {
      return this.eventSubject.asObservable().pipe(
        filter(event => event.type === eventType)
      );
    }
    return this.eventSubject.asObservable();
  }

  /**
   * Subscribe to specific event types and get only the payload
   * @param eventType - Event type to filter for
   * @returns Observable of event payloads
   */
  onPayload<T>(eventType: string): Observable<T> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType),
      map(event => event.payload as T)
    );
  }
}
