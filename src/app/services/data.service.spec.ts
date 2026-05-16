import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { STORAGE_KEYS } from '@opensourcekd/ng-common-libs';
import { DataService } from './data.service';
import { SUPPLIER_API } from './supplier-api.config';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should throw when decoded token is missing', () => {
    expect(() => service.getSupplierId()).toThrowError('Decoded token was not found in session storage.');
  });

  it('should throw when supplier id is missing', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ role: 'supplier' }));
    expect(() => service.getSupplierId()).toThrowError('Supplier ID (sub) is missing in decoded token.');
  });

  it('should read supplier identity from decoded token', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-1' }));
    expect(service.getSupplierId()).toBe('supplier-1');
  });

  it('should fetch open rfqs and unwrap data', () => {
    service.getOpenRfqs().subscribe((rfqs) => {
      expect(rfqs[0].id).toBe('rfq-1');
    });

    const req = httpMock.expectOne((request) => request.url === SUPPLIER_API.rfqs);
    expect(req.request.params.get('status')).toBe('OPEN');
    req.flush({ data: { rfqs: [{ id: 'rfq-1', title: 'Laptop Procurement', category: 'IT', quantity: 25 }] } });
  });

  it('should fetch supplier quotes with supplierId param', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-9' }));

    service.getMyQuotes().subscribe((quotes) => {
      expect(quotes[0].id).toBe('q-1');
    });

    const req = httpMock.expectOne((request) => request.url === `${SUPPLIER_API.quotesBase}/quotes`);
    expect(req.request.params.get('supplierId')).toBe('supplier-9');
    req.flush({ quotes: [{ id: 'q-1', rfqId: 'rfq-1', amount: 900, currency: 'USD', status: 'SUBMITTED' }] });
  });

  it('should submit quote for rfq', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-7' }));

    service.submitQuote({ rfqId: 'rfq-4', amount: 1200, currency: 'USD', notes: 'Fast delivery' }).subscribe((quote) => {
      expect(quote.id).toBe('q-4');
    });

    const req = httpMock.expectOne(`${SUPPLIER_API.quotesBase}/rfq-4/quotes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.supplierId).toBe('supplier-7');
    req.flush({ data: { id: 'q-4', rfqId: 'rfq-4', amount: 1200, currency: 'USD', status: 'SUBMITTED' } });
  });

  it('should fetch supplier documents with supplierId param', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-3' }));

    service.getDocuments().subscribe((documents) => {
      expect(documents[0].id).toBe('doc-1');
    });

    const req = httpMock.expectOne((request) => request.url === SUPPLIER_API.documents);
    expect(req.request.params.get('supplierId')).toBe('supplier-3');
    req.flush({ data: { documents: [{ id: 'doc-1', type: 'INVOICE', status: 'READY' }] } });
  });

  it('should create invoice document for quote', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-8' }));
    const quote = { id: 'q-8', rfqId: 'rfq-8', amount: 2222, currency: 'USD', status: 'SUBMITTED' };

    service.createInvoiceDocument(quote).subscribe((document) => {
      expect(document.id).toBe('doc-8');
    });

    const req = httpMock.expectOne(SUPPLIER_API.documents);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.type).toBe('INVOICE');
    expect(req.request.body.quoteId).toBe('q-8');
    expect(req.request.body.rfqId).toBe('rfq-8');
    expect(req.request.body.supplierId).toBe('supplier-8');
    req.flush({ data: { id: 'doc-8', type: 'INVOICE', status: 'QUEUED' } });
  });
});
