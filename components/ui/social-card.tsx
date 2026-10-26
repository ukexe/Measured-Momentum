import { siteConfig } from "@/content/site";

const beatColours = [
  "#8e2945",
  "#fff8ed",
  "#006a67",
  "#fff8ed",
  "#d9f257",
  "#fff8ed",
  "#8e2945",
  "#006a67",
] as const;

export function SocialCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 68px 56px",
        background: "#12161f",
        color: "#fff8ed",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignSelf: "flex-start",
          padding: "10px 16px",
          background: "#d9f257",
          color: "#12161f",
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {siteConfig.statusLine}
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: 18,
            color: "#d9f257",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {siteConfig.creativePlatform}
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 1020,
            fontSize: 66,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.04,
          }}
        >
          {siteConfig.descriptor}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingTop: 30,
          borderTop: "2px solid #727983",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {beatColours.map((colour, index) => (
            <div
              key={`${colour}-${index}`}
              style={{
                width: 42,
                height: 14,
                display: "flex",
                border: "2px solid #fff8ed",
                background: colour,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 420,
            display: "flex",
            color: "#f0e9de",
            fontSize: 20,
            lineHeight: 1.35,
            textAlign: "right",
          }}
        >
          A transparent proposal in development. No recognition is claimed.
        </div>
      </div>
    </div>
  );
}
