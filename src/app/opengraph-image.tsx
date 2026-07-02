import { ImageResponse } from "next/og";

export const alt = "Registruti — Trackeá tus horas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INDIGO = "#4f46e5";
const DARK = "#1e293b";

function Isotipo({ height }: { height: number }) {
  return (
    <svg width={(height * 74) / 156} height={height} viewBox="13 6 74 156" fill="none">
      <rect x="13" y="6" width="74" height="11" fill={INDIGO} />
      <rect x="13" y="17" width="10" height="12" fill={INDIGO} />
      <rect x="77" y="17" width="10" height="12" fill={INDIGO} />
      <path d="M32 36 L68 36 L50 58 Z" fill={INDIGO} />
      <rect x="45.5" y="70" width="9" height="92" fill={INDIGO} />
      <path d="M27 29 V42 Q27 60 57 82" stroke={INDIGO} strokeWidth="9" fill="none" />
      <path d="M73 29 V42 Q73 60 43 82" stroke={INDIGO} strokeWidth="9" fill="none" />
      <path
        d="M67 97 C63 87 40 85 34 97 C29 109 46 112 51 114 C60 117 71 122 66 134 C60 146 36 144 32 134"
        stroke={INDIGO}
        strokeWidth="9"
        fill="none"
      />
    </svg>
  );
}

/** Tile flotante decorativo con manecillas de reloj (patrón sutil de marca). */
function ClockTile({ size: s, rotate }: { size: number; rotate: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: s,
        height: s,
        borderRadius: s * 0.22,
        background: "#c7d2fe",
        opacity: 0.55,
        transform: `rotate(${rotate}deg)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={s * 0.5} height={s * 0.5} viewBox="0 0 24 24" fill="none">
        <path d="M12 5v7l5 3" stroke={INDIGO} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

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
          position: "relative",
        }}
      >
        {/* Patrones sutiles flotantes */}
        <div style={{ display: "flex", position: "absolute", top: -40, left: 120 }}>
          <ClockTile size={150} rotate={-14} />
        </div>
        <div style={{ display: "flex", position: "absolute", top: 40, right: -30 }}>
          <ClockTile size={190} rotate={10} />
        </div>
        <div style={{ display: "flex", position: "absolute", bottom: -50, left: -20 }}>
          <ClockTile size={170} rotate={8} />
        </div>
        <div style={{ display: "flex", position: "absolute", bottom: 40, right: 200 }}>
          <ClockTile size={110} rotate={-10} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 130,
            left: 90,
            fontSize: 84,
            fontWeight: 700,
            color: "#a5b4fc",
            opacity: 0.6,
            transform: "rotate(-12deg)",
          }}
        >
          $
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 90,
            right: 90,
            fontSize: 72,
            fontWeight: 700,
            color: "#a5b4fc",
            opacity: 0.6,
            transform: "rotate(10deg)",
          }}
        >
          $
        </div>
        <div
          style={{
            position: "absolute",
            top: 250,
            right: 60,
            display: "flex",
            background: "#c7d2fe",
            opacity: 0.6,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 34,
            padding: "10px 22px",
            borderRadius: 16,
            transform: "rotate(8deg)",
          }}
        >
          USD
        </div>

        {/* Lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Isotipo height={95} />
          <div style={{ fontSize: 56, fontWeight: 600, color: DARK, letterSpacing: -1 }}>
            Registruti
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 70,
            fontSize: 88,
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
