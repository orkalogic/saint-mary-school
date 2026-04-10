// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../lib/api";

// ═══════════════════════════════════════════════════════════════
// ERITREAN SAINT MARY ORTHODOX CHURCH — HOMEPAGE
// ALL content is now fetched from the CMS API
// ═══════════════════════════════════════════════════════════════

const C = {
  parchment: "#F5F0E8",
  warmWhite: "#FEFCF7",
  gold: "#B8860B",
  goldLight: "#D4A843",
  goldPale: "#F0E6C8",
  navy: "#1B2D4F",
  navyDeep: "#0E1A30",
  earth: "#5C3D2E",
  earthLight: "#8B6F5E",
  terracotta: "#C4613A",
  sage: "#6B7F5E",
  text: "#2C2418",
  textMuted: "#7A7062",
  cream: "#EDE7D9",
};

// ── Ge'ez-inspired decorative border pattern (SVG) ──
function GeezBorder({ width = "100%", color = C.gold, opacity = 0.15 }) {
  return (
    <svg width={width} height="12" viewBox="0 0 600 12" fill="none" style={{ display: "block", opacity }}>
      <pattern id="geez" x="0" y="0" width="40" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 6L5 0L10 6L5 12Z" fill={color} />
        <path d="M15 6L20 0L25 6L20 12Z" fill={color} />
        <circle cx="32" cy="6" r="2.5" fill={color} />
      </pattern>
      <rect width="600" height="12" fill={`url(#geez)`} />
    </svg>
  );
}

// ── Orthodox Cross ──
function Cross({ size = 24, color = C.gold, style = {} }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 24 32" fill="none" style={style}>
      <rect x="10.5" y="0" width="3" height="32" fill={color} rx="0.4" />
      <rect x="4" y="5.5" width="16" height="2.8" fill={color} rx="0.4" />
      <rect x="6.5" y="22" width="11" height="2.2" fill={color} rx="0.3" transform="rotate(-12 12 23)" />
    </svg>
  );
}

// ── Mesob-inspired decorative circle pattern ──
function MesobPattern({ size = 200, opacity = 0.06 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ opacity }}>
      <circle cx="100" cy="100" r="95" stroke={C.gold} strokeWidth="1.5" fill="none" />
      <circle cx="100" cy="100" r="75" stroke={C.gold} strokeWidth="1" fill="none" />
      <circle cx="100" cy="100" r="55" stroke={C.gold} strokeWidth="0.8" fill="none" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
        <line key={a} x1="100" y1="5" x2="100" y2="45" stroke={C.gold} strokeWidth="0.6"
          transform={`rotate(${a} 100 100)`} />
      ))}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <circle key={a} cx="100" cy="17" r="3" fill={C.gold}
          transform={`rotate(${a} 100 100)`} />
      ))}
    </svg>
  );
}

// Default gradient for events without images
const defaultGradients = [
  `linear-gradient(135deg, #2C1810 0%, #4A2C1A 30%, #6B3A20 60%, #3D2415 100%)`,
  `linear-gradient(135deg, #0E1A30 0%, #1E3456 40%, #2A4570 70%, #1B2D4F 100%)`,
  `linear-gradient(135deg, #1A2E1A 0%, #2D4A2D 40%, #3D5C3D 70%, #1A2E1A 100%)`,
  `linear-gradient(135deg, #3D1F3D 0%, #5C2E5C 40%, #4A2040 70%, #2E152E 100%)`,
  `linear-gradient(135deg, #4A3010 0%, #6B4A20 40%, #5C3A18 70%, #3D2410 100%)`,
];

export default function HomePage() {
  // ── All CMS data ──
  const [events, setEvents] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [fastingSeasons, setFastingSeasons] = useState([]);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [verseIdx, setVerseIdx] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Selam! 🙏 I'm here to help with questions about the Orthodox faith, church services, or how to use this platform. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // Fetch all CMS data
  useEffect(() => {
    Promise.all([
      api.cms.events.getAll().catch(() => []),
      api.cms.blog.getAll().catch(() => []),
      api.cms.fasting.getAll().catch(() => []),
      api.cms.verses.getAll().catch(() => []),
    ]).then(([e, b, f, v]) => {
      setEvents(e || []);
      setBlogPosts((b || []).filter(p => p.category !== "page"));
      setFastingSeasons(f || []);
      setVerses(v || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Auto-advance carousel (top 5 events)
  const slides = (events || []).slice(0, 5).map((ev, i) => ({
    id: ev.id,
    title: ev.title,
    subtitle: ev.description?.substring(0, 80) || "",
    image: ev.cover_image || null,
    date: ev.date,
    location: ev.location,
  }));

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  // Rotate verse
  const verseList = verses.length > 0 ? verses : [
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6" },
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  ];

  useEffect(() => {
    const t = setInterval(() => setVerseIdx(p => (p + 1) % verseList.length), 12000);
    return () => clearInterval(t);
  }, [verseList.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(p => [...p, { role: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(p => [...p, {
        role: "assistant",
        text: "Thank you for your question! In a live version, this would connect to an AI assistant trained on Orthodox teachings and church resources. For now, please reach out to our church office or Sunday School coordinator for detailed guidance. God bless! 🙏"
      }]);
    }, 1200);
  }, [chatInput]);

  const navBg = Math.min(scrollY / 150, 1);
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.parchment, color: C.textMuted }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: C.text, background: C.parchment, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideCarousel { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        @keyframes gentlePulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes verseSwap { 0% { opacity: 0; transform: translateY(10px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes chatBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fu { animation: fadeUp 0.7s ease-out both; }
        .fu1 { animation: fadeUp 0.7s 0.08s ease-out both; }
        .fu2 { animation: fadeUp 0.7s 0.16s ease-out both; }
        .fu3 { animation: fadeUp 0.7s 0.24s ease-out both; }
        .fu4 { animation: fadeUp 0.7s 0.32s ease-out both; }

        .sans { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .serif { font-family: 'Cormorant Garamond', 'Georgia', serif; }

        .nav-link {
          font-family: 'DM Sans', sans-serif; color: white; text-decoration: none;
          font-size: 14px; font-weight: 500; opacity: 0.8; transition: opacity 0.2s;
          letter-spacing: 0.4px;
        }
        .nav-link:hover { opacity: 1; }

        .card {
          background: ${C.warmWhite}; border-radius: 14px; border: 1px solid rgba(184,134,11,0.08);
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1); overflow: hidden;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(44,36,24,0.08); border-color: rgba(184,134,11,0.18); }

        .pill {
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 1.2px; text-transform: uppercase; padding: 5px 14px;
          border-radius: 20px; display: inline-block;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 38px);
          font-weight: 600; color: ${C.navy}; line-height: 1.2;
        }
        .section-label {
          font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; color: ${C.gold};
          margin-bottom: 10px; display: block;
        }

        .chat-fab {
          position: fixed; bottom: 28px; right: 28px; z-index: 200;
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, ${C.navy}, ${C.navyDeep});
          border: 2px solid ${C.gold}40; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 30px rgba(14,26,48,0.35);
          transition: all 0.3s ease;
        }
        .chat-fab:hover { transform: scale(1.08); box-shadow: 0 12px 40px rgba(14,26,48,0.45); }

        .carousel-dot {
          width: 8px; height: 8px; border-radius: 50%; border: none;
          cursor: pointer; transition: all 0.3s ease; padding: 0;
        }

        .event-row {
          display: flex; align-items: center; gap: 16px; padding: 16px 0;
          border-bottom: 1px solid rgba(184,134,11,0.08);
          transition: background 0.2s;
        }
        .event-row:last-child { border-bottom: none; }
        .event-row:hover { background: rgba(184,134,11,0.03); }

        .mobile-menu-btn { display: none; background: none; border: none; color: white; cursor: pointer; padding: 8px; }
        @media (max-width: 820px) {
          .mobile-menu-btn { display: block; }
          .desktop-nav { display: none !important; }
        }

        /* Chat panel */
        .chat-panel {
          position: fixed; bottom: 100px; right: 28px; z-index: 199;
          width: 380px; max-width: calc(100vw - 40px); height: 500px; max-height: 70vh;
          background: ${C.warmWhite}; border-radius: 20px;
          box-shadow: 0 20px 60px rgba(14,26,48,0.25);
          display: flex; flex-direction: column; overflow: hidden;
          border: 1px solid rgba(184,134,11,0.15);
          animation: fadeUp 0.35s ease-out;
        }
      `}</style>

      {/* ══════════════ NAVIGATION ══════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: `rgba(14, 26, 48, ${0.15 + navBg * 0.85})`,
        backdropFilter: navBg > 0.3 ? "blur(16px)" : "none",
        borderBottom: navBg > 0.5 ? `1px solid rgba(184,134,11,0.12)` : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Cross size={22} color={C.goldLight} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: "white", lineHeight: 1.1 }}>ቅድስት ማርያም</div>
              <div className="sans" style={{ fontSize: 10, color: C.goldLight, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Saint Mary Orthodox Church</div>
            </div>
          </a>

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#events" className="nav-link">Events</a>
            <a href="#blog" className="nav-link">Blog</a>
            <a href="#fasting" className="nav-link">Fasting</a>
            <a href="#contact" className="nav-link">Contact</a>
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />

            {/* Dropdown-style "Join Us" */}
            <div style={{ position: "relative" }}
              onMouseEnter={e => e.currentTarget.querySelector('.dropdown').style.cssText = 'opacity:1;pointer-events:auto;transform:translateY(0);'}
              onMouseLeave={e => e.currentTarget.querySelector('.dropdown').style.cssText = 'opacity:0;pointer-events:none;transform:translateY(8px);'}
            >
              <span className="nav-link" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                Join Us
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </span>
              <div className="dropdown" style={{
                position: "absolute", top: "100%", right: 0, marginTop: 12,
                background: C.warmWhite, borderRadius: 12, padding: 8, minWidth: 200,
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)", border: `1px solid ${C.gold}20`,
                opacity: 0, pointerEvents: "none", transform: "translateY(8px)",
                transition: "all 0.25s ease",
              }}>
                <a href="/enroll/student" className="sans" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  borderRadius: 8, textDecoration: "none", color: C.text, fontSize: 14, fontWeight: 500,
                  transition: "background 0.2s",
                }} onMouseEnter={e => e.target.style.background = C.goldPale + "60"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  🎓 Enroll as Student
                </a>
                <a href="/enroll/teacher" className="sans" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  borderRadius: 8, textDecoration: "none", color: C.text, fontSize: 14, fontWeight: 500,
                  transition: "background 0.2s",
                }} onMouseEnter={e => e.target.style.background = C.goldPale + "60"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  📖 Volunteer as Teacher
                </a>
                <a href="/enroll/parent" className="sans" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  borderRadius: 8, textDecoration: "none", color: C.text, fontSize: 14, fontWeight: 500,
                  transition: "background 0.2s",
                }} onMouseEnter={e => e.target.style.background = C.goldPale + "60"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  👨‍👩‍👧 Register as Parent
                </a>
              </div>
            </div>

            <a href="/auth/sign-in" className="sans" style={{
              padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: "none", color: C.navy, background: C.goldLight,
              transition: "all 0.2s",
            }}>
              Sign In
            </a>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenu ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>

        {mobileMenu && (
          <div style={{ background: C.navyDeep, padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${C.gold}20` }}>
            {["Events", "Blog", "Fasting", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" onClick={() => setMobileMenu(false)}>{l}</a>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
            <a href="/enroll/student" className="nav-link" onClick={() => setMobileMenu(false)}>🎓 Enroll as Student</a>
            <a href="/enroll/teacher" className="nav-link" onClick={() => setMobileMenu(false)}>📖 Volunteer as Teacher</a>
            <a href="/auth/sign-in" className="sans nav-link" style={{ opacity: 1, background: C.goldLight, color: C.navy, padding: "10px 20px", borderRadius: 8, textAlign: "center", fontWeight: 600, marginTop: 4 }}>
              Sign In
            </a>
          </div>
        )}
      </nav>

      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section style={{ position: "relative", height: "85vh", minHeight: 520, maxHeight: 780, overflow: "hidden" }}>
        {slides.map((slide, i) => (
          <div key={slide.id} style={{
            position: "absolute", inset: 0,
            background: slide.image ? `url(${slide.image}) center/cover` : defaultGradients[i % defaultGradients.length],
            opacity: currentSlide === i ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            zIndex: currentSlide === i ? 1 : 0,
          }}>
            {/* Texture overlay */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

            {/* Decorative mesob pattern */}
            <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)" }}>
              <MesobPattern size={350} opacity={0.04} />
            </div>
          </div>
        ))}

        {/* Content overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%" }}>
            <div style={{ maxWidth: 600 }}>
              <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Cross size={18} color={C.goldLight} />
                <span className="sans" style={{ color: C.goldLight, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" }}>
                  Latest Event
                </span>
              </div>

              {slides.map((slide, i) => (
                currentSlide === i && (
                  <div key={slide.id} style={{ animation: "fadeUp 0.8s ease-out" }}>
                    <h1 style={{
                      fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, color: "white",
                      lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.5px",
                    }}>
                      {slide.title}
                    </h1>
                    <p className="sans" style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 28 }}>
                      {slide.subtitle}
                    </p>
                    <a href="#events" className="sans" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                      textDecoration: "none", color: C.navy,
                      background: C.goldLight, transition: "all 0.3s",
                    }}>
                      View All Events
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Carousel dots */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", gap: 10 }}>
          {slides.map((_, i) => (
            <button key={i} className="carousel-dot" onClick={() => setCurrentSlide(i)} style={{
              background: currentSlide === i ? C.goldLight : "rgba(255,255,255,0.3)",
              width: currentSlide === i ? 28 : 8,
              borderRadius: currentSlide === i ? 4 : 50,
            }} />
          ))}
        </div>

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: `linear-gradient(transparent, ${C.parchment})`, zIndex: 2 }} />
      </section>

      {/* ══════════════ VERSE OF THE DAY ══════════════ */}
      <section style={{ padding: "40px 24px 60px", position: "relative" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <GeezBorder width="100%" color={C.gold} opacity={0.2} />
          <div style={{ padding: "36px 24px", position: "relative" }}>
            <span className="sans section-label" style={{ fontSize: 10 }}>Verse of the Day</span>
            <div style={{ position: "relative", minHeight: 90 }}>
              {verseList.map((v, i) => (
                verseIdx === i && (
                  <div key={i} style={{ animation: "fadeUp 0.6s ease-out" }}>
                    <p style={{ fontSize: "clamp(18px, 2.8vw, 24px)", fontWeight: 400, fontStyle: "italic", color: C.earth, lineHeight: 1.65, marginBottom: 14 }}>
                      "{v.text || ""}"
                    </p>
                    <span className="sans" style={{ fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: 1 }}>— {v.reference || v.ref}</span>
                  </div>
                )
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
              {verseList.map((_, i) => (
                <button key={i} onClick={() => setVerseIdx(i)} style={{
                  width: 6, height: 6, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                  background: verseIdx === i ? C.gold : C.cream, transition: "all 0.3s",
                }} />
              ))}
            </div>
          </div>
          <GeezBorder width="100%" color={C.gold} opacity={0.2} />
        </div>
      </section>

      {/* ══════════════ UPCOMING EVENTS ══════════════ */}
      <section id="events" style={{ padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="sans section-label">Mark Your Calendar</span>
              <h2 className="section-title">Upcoming Events</h2>
            </div>
            <a href="/events" className="sans" style={{ fontSize: 14, fontWeight: 600, color: C.gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              View all events
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {events.map((ev, i) => (
              <div key={i} className="card" style={{ padding: 24, cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 56, minWidth: 56, textAlign: "center", padding: "10px 0",
                    background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`,
                    borderRadius: 10, color: "white",
                  }}>
                    <div className="sans" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7 }}>{new Date(ev.date).toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="sans" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{new Date(ev.date).getDate()}</div>
                    <div className="sans" style={{ fontSize: 10, opacity: 0.6 }}>{new Date(ev.date).toLocaleDateString("en-US", { month: "short" })}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: C.navy, marginBottom: 8, lineHeight: 1.3 }}>{ev.title}</h3>
                    <div className="sans" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13, color: C.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {ev.start_time || ev.time}
                      </span>
                      <span style={{ fontSize: 13, color: C.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {ev.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BLOG / ARTICLES ══════════════ */}
      <section id="blog" style={{ padding: "60px 24px 80px", background: C.warmWhite }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="sans section-label">From Our Community</span>
              <h2 className="section-title">Blog & Reflections</h2>
            </div>
            <a href="/blog" className="sans" style={{ fontSize: 14, fontWeight: 600, color: C.gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              Read all posts →
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {blogPosts.map((post, i) => (
              <div key={post.id} className="card" style={{ cursor: "pointer" }}>
                {/* Decorative header band */}
                <div style={{
                  height: 120, position: "relative", overflow: "hidden",
                  background: `linear-gradient(135deg, ${C.navy}${["DD", "CC", "BB"][i]}, ${C.earth}${["99", "88", "77"][i]})`,
                }}>
                  <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                    <MesobPattern size={120} opacity={0.08} />
                  </div>
                  <div style={{ position: "absolute", left: 20, bottom: 14 }}>
                    <span className="sans pill" style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)" }}>
                      {post.category || "Blog"}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "20px 24px 24px" }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: C.navy, marginBottom: 10, lineHeight: 1.3 }}>
                    {post.title}
                  </h3>
                  <p className="sans" style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65, marginBottom: 16 }}>
                    {post.excerpt}
                  </p>
                  <div className="sans" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                    <span>{"5 min"} read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FASTING SCHEDULE ══════════════ */}
      <section id="fasting" style={{ padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="sans section-label">Spiritual Discipline</span>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Fasting Calendar</h2>
            <p className="sans" style={{ fontSize: 15, color: C.textMuted, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              The Orthodox Church observes over 200 fasting days each year. Here are the major fasting seasons.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {fastingSeasons.map((fast, i) => {
              const isActive = fast.is_active;
              return (
              <div key={i} className="card" style={{
                padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
                borderLeft: isActive ? `4px solid ${C.terracotta}` : `4px solid transparent`,
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                  background: isActive ? `${C.terracotta}12` : `${C.navy}08`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Cross size={18} color={isActive ? C.terracotta : C.earthLight} />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: C.navy, marginBottom: 3 }}>{fast.name}</h3>
                  {fast.name_geez && <span className="sans" style={{ fontSize: 13, color: C.gold, marginBottom: 2 }}>{fast.name_geez}</span>}
                  <span className="sans" style={{ fontSize: 13, color: C.textMuted }}>{fast.start_date} – {fast.end_date}</span>
                </div>
                <div className="sans" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: C.textMuted }}>{fast.total_days} days</span>
                  <span className="pill" style={{
                    background: isActive ? `${C.terracotta}15` : `${C.sage}12`,
                    color: isActive ? C.terracotta : C.sage,
                  }}>
                    {isActive ? "● Ongoing" : "Upcoming"}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ PAST EVENTS GALLERY ══════════════ */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <span className="sans section-label">Memories</span>
              <h2 className="section-title">Past Events</h2>
            </div>
            <a href="/events" className="sans" style={{ fontSize: 14, fontWeight: 600, color: C.gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              View all events
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {events.filter(ev => new Date(ev.date) < new Date()).slice(0, 6).map((ev, i) => (
              <a key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
                  {ev.cover_image ? (
                    <img src={ev.cover_image} alt={ev.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "16/9", background: defaultGradients[i % defaultGradients.length] }} />
                  )}
                  <div style={{ padding: "16px 20px" }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: C.navy, marginBottom: 6, lineHeight: 1.3 }}>{ev.title}</h3>
                    <div style={{ display: "flex", gap: 12, fontSize: 13, color: C.textMuted }}>
                      <span>📅 {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {events.filter(ev => new Date(ev.date) < new Date()).length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: C.textMuted, border: "1px solid #E5E7EB", borderRadius: 12 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No past events yet</p>
              <p style={{ fontSize: 14 }}>Past events with photos will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ COMMUNITY CTA ══════════════ */}
      <section style={{
        padding: "70px 24px", position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`,
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03 }}>
          <svg width="100%" height="100%"><pattern id="cp" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25 0v50M0 25h50" stroke="white" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#cp)"/></svg>
        </div>
        <div style={{ position: "absolute", left: "5%", top: "50%", transform: "translateY(-50%)" }}>
          <MesobPattern size={280} opacity={0.04} />
        </div>
        <div style={{ maxWidth: 650, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <Cross size={32} color={C.goldLight} style={{ margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600, color: "white", lineHeight: 1.25, marginBottom: 16 }}>
            Growing Together in Faith<br />& Knowledge
          </h2>
          <p className="sans" style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
            Our Sunday School nurtures the spiritual and intellectual growth of our children through Orthodox teachings, community, and love.
          </p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            <a href="/about" className="sans" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              textDecoration: "none", color: C.navy, background: C.goldLight,
            }}>
              Learn About Our School
            </a>
            <a href="#contact" className="sans" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              textDecoration: "none", color: "white", border: "1.5px solid rgba(255,255,255,0.25)",
            }}>
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer id="contact" style={{ background: "#080E1A", padding: "56px 24px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 36, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Cross size={18} color={C.goldLight} />
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>ቅድስት ማርያም</span>
                  <div className="sans" style={{ fontSize: 10, color: C.goldLight, letterSpacing: 1.5 }}>SAINT MARY ORTHODOX</div>
                </div>
              </div>
              <p className="sans" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                Eritrean Orthodox Tewahdo Church — serving our community in faith, worship, and education since 1998.
              </p>
            </div>
            <div>
              <h4 className="sans" style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Navigate</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Home", "Events", "Blog", "Fasting Calendar", "Sunday School"].map(l => (
                  <a key={l} href="#" className="sans" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = C.goldLight} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>
                    {l}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="sans" style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Contact</h4>
              <div className="sans" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                <span>📍 123 Church Street, Raleigh, NC</span>
                <span>📞 (919) 555-0123</span>
                <span>✉️ info@saintmaryeotc.org</span>
              </div>
            </div>
            <div>
              <h4 className="sans" style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Services</h4>
              <div className="sans" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                <span>ቅዳሴ (Liturgy): Sunday 6 AM</span>
                <span>Sunday School: 10:00 AM</span>
                <span>Bible Study: Wed 7 PM</span>
                <span>ጸሎተ ሐሙስ: Thursday 6 PM</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span className="sans" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              © 2026 Saint Mary Eritrean Orthodox Tewahdo Church. ስብሐት ለእግዚአብሔር
            </span>
            <div className="sans" style={{ display: "flex", gap: 16 }}>
              {["Privacy", "Terms"].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════ CHAT FAB + PANEL ══════════════ */}
      <button className="chat-fab" onClick={() => setChatOpen(!chatOpen)} aria-label="Open chat support">
        {chatOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.goldLight} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.goldLight} strokeWidth="1.8">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <path d="M8 9h8M8 13h5" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {chatOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div style={{
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
            background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`,
            borderBottom: `1px solid ${C.gold}20`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `${C.gold}25`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Cross size={14} color={C.goldLight} />
            </div>
            <div>
              <div className="sans" style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Church Assistant</div>
              <div className="sans" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Ask about faith, services, or the app</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                animation: "fadeUp 0.3s ease-out",
              }}>
                <div className="sans" style={{
                  maxWidth: "82%", padding: "10px 14px", borderRadius: 14,
                  fontSize: 13.5, lineHeight: 1.55,
                  background: msg.role === "user" ? C.navy : C.cream,
                  color: msg.role === "user" ? "white" : C.text,
                  borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: msg.role === "user" ? 14 : 4,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.gold}10`, display: "flex", gap: 8 }}>
            <input
              className="sans"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleChat()}
              placeholder="Ask a question..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.cream}`,
                fontSize: 13.5, background: C.parchment, color: C.text, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button onClick={handleChat} style={{
              width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer",
              background: C.navy, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.goldLight} strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
