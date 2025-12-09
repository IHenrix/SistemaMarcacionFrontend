import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SpinnerService } from '@app/services/spinner.service';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  // Verificar si la petición tiene el header para omitir el spinner
  const skipSpinner = req.headers.has('X-Skip-Spinner');

  // Solo muestra el spinner si no tiene el header de omitir
  if (!skipSpinner) {
    spinnerService.show();
  }

  return next(req).pipe(
    finalize(() => {
      // Solo oculta el spinner si lo había mostrado
      if (!skipSpinner) {
        spinnerService.hide();
      }
    })
  );
};
