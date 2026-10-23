import type { Profile } from "@/lib/types";

/** Datos del emisor (el usuario) que van en el invoice: el "De:" y cómo cobrar. */
export interface InvoiceIssuer {
  businessName?: string | null;
  taxId?: string | null;
  email?: string | null;
  address?: string | null;
  /** Alias/CBU, PayPal, Wise, cripto… texto libre, al pie del invoice. */
  paymentDetails?: string | null;
}

/** ¿Hay algo que mostrar en el bloque "De:"? Los datos de pago van aparte. */
export function hasIssuerData(issuer?: InvoiceIssuer | null): issuer is InvoiceIssuer {
  return !!issuer && !!(issuer.businessName || issuer.taxId || issuer.email || issuer.address);
}

/**
 * Del perfil (snake_case, tal como sale de la base o del RPC del link público)
 * al emisor del invoice. Null si no hay perfil.
 */
export function issuerFromProfile(
  profile:
    | Partial<
        Pick<Profile, "business_name" | "tax_id" | "email" | "address" | "payment_details">
      >
    | null
    | undefined
): InvoiceIssuer | null {
  if (!profile) return null;
  return {
    businessName: profile.business_name ?? null,
    taxId: profile.tax_id ?? null,
    email: profile.email ?? null,
    address: profile.address ?? null,
    paymentDetails: profile.payment_details ?? null,
  };
}
