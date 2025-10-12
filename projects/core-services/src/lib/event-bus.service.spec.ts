import { TestBed } from '@angular/core/testing';
import { EventBusService, BusEvent } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit and receive events', (done) => {
    const testEvent = { type: 'test-event', payload: { message: 'Hello' } };
    
    service.on('test-event').subscribe((event: BusEvent) => {
      expect(event.type).toBe('test-event');
      expect(event.payload.message).toBe('Hello');
      done();
    });

    service.emit('test-event', { message: 'Hello' });
  });

  it('should filter events by type', (done) => {
    let receivedCount = 0;

    service.on('specific-event').subscribe(() => {
      receivedCount++;
    });

    service.emit('other-event', { data: 'ignored' });
    service.emit('specific-event', { data: 'received' });
    service.emit('another-event', { data: 'ignored' });

    setTimeout(() => {
      expect(receivedCount).toBe(1);
      done();
    }, 100);
  });

  it('should receive all events when no filter is specified', (done) => {
    let receivedCount = 0;

    service.on().subscribe(() => {
      receivedCount++;
    });

    service.emit('event-1');
    service.emit('event-2');
    service.emit('event-3');

    setTimeout(() => {
      expect(receivedCount).toBe(3);
      done();
    }, 100);
  });

  it('should extract payload using onPayload', (done) => {
    interface TestPayload {
      value: number;
    }

    service.onPayload<TestPayload>('data-event').subscribe((payload) => {
      expect(payload.value).toBe(42);
      done();
    });

    service.emit('data-event', { value: 42 });
  });
});
