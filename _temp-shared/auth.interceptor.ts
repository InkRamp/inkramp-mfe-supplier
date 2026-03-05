import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'auth0_access_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
