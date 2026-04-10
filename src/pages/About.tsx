import { Link } from "react-router-dom";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const CREAM = "#FAFAF5";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <nav style={{ background: NAVY, padding: "16px 32px", display: "flex", alignItems: "center", gap: 24 }}>
        <Link to="/" style={{ color: GOLD, textDecoration: "none", fontSize: 20, fontWeight: "bold" }}>
          Saint Mary Church School
        </Link>
      </nav>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10013;</div>
        <h1 style={{ color: NAVY, fontSize: 36, marginBottom: 16 }}>About Us</h1>
        <div style={{ width: 60, height: 3, background: GOLD, margin: "0 auto 32px" }} />
        <p style={{ fontSize: 20, color: "#555" }}>Coming Soon</p>
        <p style={{ color: "#777", marginTop: 16 }}>
          Learn about our mission, values, and the rich heritage of the Eritrean Orthodox faith.
        </p>
      </div>
    </div>
  );
}
