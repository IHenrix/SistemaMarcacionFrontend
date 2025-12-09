import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SpinnerService } from '@app/services/spinner.service';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  // Muestra el spinner antes de la petición
  spinnerService.show();

  return next(req).pipe(
    finalize(() => {
      // Oculta el spinner cuando termina la petición (éxito o error)
      spinnerService.hide();
    })
  );
};
