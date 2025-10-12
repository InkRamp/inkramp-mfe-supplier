// projects/core-services/src/lib/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  id = 'auth of pokemon';

  constructor() {
    console.log("In constructor of auth service in pokemon");
  }

  // Authentication will be handled differently in the future via API
}
