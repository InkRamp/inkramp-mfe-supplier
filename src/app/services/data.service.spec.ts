import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { STORAGE_KEYS } from '@opensourcekd/ng-common-libs';
import { DataService } from './data.service';
import { SUPPLIER_API } from './supplier-api.contract';

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

  it('should fetch open rfqs without unsupported query params', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-1' }));

    service.getOpenRfqs().subscribe((rfqs) => {
      expect(rfqs.length).toBe(1);
      expect(rfqs[0].id).toBe('rfq-1');
      expect(rfqs[0].status).toBe('open');
    });

    const req = httpMock.expectOne(SUPPLIER_API.rfqs);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({
      data: [
        { id: 'rfq-1', title: 'Brochure print', status: 'open', supplierIds: ['supplier-1'], items: [{ name: 'Brochure', qty: 5000 }] },
        { id: 'rfq-2', title: 'Closed job', status: 'closed', supplierIds: ['supplier-1'], items: [{ name: 'Poster', qty: 10 }] }
      ]
    });
  });

  it('should fetch supplier quotes from rfq-specific quote endpoints', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-9' }));

    service.getMyQuotes().subscribe((quotes) => {
      expect(quotes.length).toBe(1);
      expect(quotes[0].id).toBe('q-1');
      expect(quotes[0].rfqId).toBe('rfq-1');
    });

    httpMock.expectOne(SUPPLIER_API.rfqs).flush({
      data: [
        { id: 'rfq-1', title: 'Catalogues', status: 'open', supplierIds: ['supplier-9'] },
        { id: 'rfq-2', title: 'Signage', status: 'open', supplierIds: ['supplier-9'] }
      ]
    });

    const requests = httpMock.match((request) => request.url === SUPPLIER_API.quotes('rfq-1') || request.url === SUPPLIER_API.quotes('rfq-2'));
    expect(requests.length).toBe(2);

    requests.find((request) => request.request.url === SUPPLIER_API.quotes('rfq-1'))?.flush({
      data: [{ id: 'q-1', rfqId: 'rfq-1', supplierId: 'supplier-9', totalPrice: 900, currency: 'USD', status: 'pending' }]
    });
    requests.find((request) => request.request.url === SUPPLIER_API.quotes('rfq-2'))?.flush({
      data: [{ id: 'q-2', rfqId: 'rfq-2', supplierId: 'supplier-8', totalPrice: 700, currency: 'USD', status: 'pending' }]
    });
  });

  it('should submit quote using swagger payload fields', () => {
    service.submitQuote({ rfqId: 'rfq-4', totalPrice: 1200, currency: 'USD', notes: 'Fast delivery', validUntil: '' }).subscribe((quote) => {
      expect(quote.id).toBe('q-4');
      expect(quote.totalPrice).toBe(1200);
    });

    const req = httpMock.expectOne(SUPPLIER_API.quotes('rfq-4'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ totalPrice: 1200, currency: 'USD', notes: 'Fast delivery', validUntil: undefined });
    req.flush({ data: { id: 'q-4', rfqId: 'rfq-4', totalPrice: 1200, currency: 'USD', status: 'pending' } });
  });

  it('should fetch documents from swagger document endpoint', () => {
    service.getDocuments().subscribe((documents) => {
      expect(documents.length).toBe(1);
      expect(documents[0].id).toBe('doc-1');
    });

    const req = httpMock.expectOne(SUPPLIER_API.documents);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [{ id: 'doc-1', name: 'Quote PDF', status: 'processing' }] });
  });
});
