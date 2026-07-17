-- País del emisor: define la etiqueta y el formato esperado del ID fiscal
-- (CUIT, RUT, RFC, ...), la moneda sugerida para proyectos nuevos y el locale
-- con el que se formatean los montos en la app.

alter table public.profiles
  add column if not exists country text;

comment on column public.profiles.country is
  'Código ISO 3166-1 alfa-2 del país del emisor (AR, UY, CL, ...) u OTRO. La configuración por país vive en src/lib/countries.ts.';
