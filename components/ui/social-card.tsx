import { siteConfig } from "@/content/site";

const beatColours = [
  "#ff6b86",
  "#d9b878",
  "#45d6cc",
  "#9aaaff",
  "#d9f257",
  "#ff6b86",
  "#45d6cc",
  "#d9b878",
] as const;

export function SocialCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        flexDirection: "column",
        overflow: "hidden",
        padding: "46px 58px 48px",
        background: "#05060a",
        color: "#f7f1e6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 18,
          borderBottom: "1px solid #6c6d68",
          color: "#d9f257",
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex" }}>MM / 01 / Public proposal</div>
        <div style={{ display: "flex" }}>{siteConfig.statusLine}</div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 730,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#ff6b86",
              fontSize: 102,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.82,
              textTransform: "uppercase",
            }}
          >
            Measured
          </div>
          <div
            style={{
              display: "flex",
              color: "#f7f1e6",
              fontSize: 102,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.82,
              textTransform: "uppercase",
            }}
          >
            Momentum
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              color: "#e2dbcd",
              fontSize: 27,
              fontWeight: 600,
            }}
          >
            {siteConfig.descriptor}
          </div>
        </div>

        <div
          style={{
            width: 278,
            height: 278,
            display: "flex",
            position: "relative",
            border: "1px solid #6c6d68",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 56,
              left: 24,
              width: 224,
              height: 72,
              display: "flex",
              border: "15px solid #ff6b86",
              borderRadius: "50%",
              transform: "rotate(-17deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 56,
              width: 224,
              height: 72,
              display: "flex",
              border: "13px solid #45d6cc",
              borderRadius: "50%",
              transform: "rotate(17deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 124,
              left: 124,
              width: 30,
              height: 30,
              display: "flex",
              background: "#d9f257",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingTop: 20,
          borderTop: "1px solid #6c6d68",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {beatColours.map((colour, index) => (
            <div
              key={`${colour}-${index}`}
              style={{
                width: 54,
                height: 6,
                display: "flex",
                background: colour,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 420,
            display: "flex",
            color: "#aaa395",
            fontSize: 18,
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
