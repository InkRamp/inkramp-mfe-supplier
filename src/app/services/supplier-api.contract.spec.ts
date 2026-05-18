import { ASSIGNMENT_API_V1_BASE_URL } from '@temp-shared/config/assignment-api';
import { SUPPLIER_API } from './supplier-api.contract';

describe('SUPPLIER_API', () => {
  it('should resolve swagger-backed endpoints from the local assignment API base', () => {
    expect(SUPPLIER_API.rfqs).toBe(`${ASSIGNMENT_API_V1_BASE_URL}/rfqs`);
    expect(SUPPLIER_API.documents).toBe(`${ASSIGNMENT_API_V1_BASE_URL}/documents`);
    expect(SUPPLIER_API.catalogItems).toBe(`${ASSIGNMENT_API_V1_BASE_URL}/catalog/items`);
  });
});
