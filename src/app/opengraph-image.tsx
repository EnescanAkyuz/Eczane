import { ImageResponse } from "next/og";

export const alt = "NobetHizli";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 15% 20%, #1ad39e 0%, transparent 45%), radial-gradient(circle at 85% 20%, #6ad5ff 0%, transparent 45%), linear-gradient(180deg, #071b1a 0%, #0f3d39 100%)",
          color: "#f3f7ff",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "60px",
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
          NobetHizli
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            marginTop: 24,
            maxWidth: 920,
            opacity: 0.95,
          }}
        >
          En yakin nobetci eczane, hizli yol tarifi ve tek dokunusla arama
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

