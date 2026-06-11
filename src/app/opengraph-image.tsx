import { ImageResponse } from "next/og";

export const alt = "Diamble Jambe — Control de horas y facturación para freelancers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="110" height="110" viewBox="0 0 64 64" fill="none">
            <path
              d="M33.3 3.4c.5-.4 1.3 0 1.2.7-.6 5 .8 8.6 4.4 13.2 3.3 4.2 8.3 8.5 11.2 14.7 1.2 2.6 1.9 5.5 1.9 8.4C52 53 43 60.6 32 60.6S12 53 12 40.4c0-7.6 4.6-12.3 8-17.2.8-1.1 2.5-.6 2.5.8.1 2.4.5 4.6 1.9 6 .3-7.1 2.2-12.5 4.8-16.7 1.9-3.2 2.6-8 4.1-9.9z"
              fill="#f97316"
            />
            <path
              d="M32.6 29.6c.3-.5 1-.5 1.3 0 1.5 3 3.7 5.2 5.6 7.4 2 2.3 3.7 4.8 3.7 8.4 0 6.6-5 10.8-11.2 10.8s-11.2-4.2-11.2-10.8c0-4.5 2.7-7.1 4.6-9.8.4-.6 1.4-.4 1.5.4.2 1.3.6 2.5 1.6 3.3.3-4.2 2.4-7 4.1-9.7z"
              fill="#fbbf24"
            />
          </svg>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>Diamble Jambe</div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 38,
            color: "#cbd5e1",
            textAlign: "center",
            maxWidth: 980,
          }}
        >
          Control de horas y facturación para freelancers, en español
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 28,
            color: "#0f172a",
            background: "linear-gradient(90deg, #f59e0b, #f97316)",
            padding: "16px 40px",
            borderRadius: 14,
            fontWeight: 600,
          }}
        >
          Empezá gratis hoy → diamble-jamble.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
