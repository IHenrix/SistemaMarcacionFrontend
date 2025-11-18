import { MatDateFormats, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
export const dateFormatProviders = [
  { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
];
