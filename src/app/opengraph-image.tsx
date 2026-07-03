import { ImageResponse } from "next/og";

export const alt = "Registruti — Trackeá tus horas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INDIGO = "#4f46e5";
const DARK = "#1e293b";

/**
 * Versión provisional de la imagen social: lockup + headline sobre Light Slate.
 * Se reemplaza por el asset oficial guardándolo como src/app/opengraph-image.png
 * (y borrando este archivo).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={46} height={95} viewBox="22 10 56 145.5" fill="none">
            <rect x="22" y="10" width="56" height="9" fill={INDIGO} />
            <rect x="22" y="19" width="9" height="10" fill={INDIGO} />
            <rect x="69" y="19" width="9" height="10" fill={INDIGO} />
            <path d="M34 36 L66 36 L50 54 Z" fill={INDIGO} />
            <rect x="46" y="71.5" width="8" height="84" fill={INDIGO} />
            <path d="M26.5 29 L26.5 40 C26.5 55 36 62 50 71.5 L61 79" stroke={INDIGO} strokeWidth="8" fill="none" />
            <path d="M73.5 29 L73.5 40 C73.5 55 64 62 50 71.5 L39 79" stroke={INDIGO} strokeWidth="8" fill="none" />
            <path
              d="M64.5 95 C61 87.5 41 86 35.5 95.5 C30.5 104.5 43 108.5 50 110.5 C57 112.5 68.5 116.5 64 126.5 C59.5 136.5 38 135.5 34.5 127"
              stroke={INDIGO}
              strokeWidth="8"
              fill="none"
            />
          </svg>
          <div style={{ fontSize: 54, fontWeight: 600, color: DARK, letterSpacing: -1 }}>
            Registruti
          </div>
        </div>
        <div
          style={{
            marginTop: 64,
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -3,
            color: DARK,
            textAlign: "center",
          }}
        >
          Trackeá tus horas.
        </div>
      </div>
    ),
    { ...size }
  );
}
