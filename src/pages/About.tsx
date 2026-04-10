// src/pages/About.tsx
export default function About() {
  return (
    <div style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)', padding: '80px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 42, marginBottom: 8 }}>
          About Our School
        </h1>
        <p style={{ fontSize: 20, color: '#C9A84C', fontFamily: 'Cormorant Garamond, serif' }}>
          ቅድስት ማርያም ቤተክርስቲያን ቤት ትምህርቲ
        </p>
        <p style={{ fontSize: 16, maxWidth: 600, margin: '16px auto 0', opacity: 0.9, lineHeight: 1.6 }}>
          Nurturing faith, knowledge, and character in the Eritrean Orthodox Tewahdo tradition.
        </p>
      </div>

      {/* Mission */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 16 }}>Our Mission</h2>
        <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: 16 }}>
          Saint Mary Orthodox Church School exists to provide spiritual and academic formation for children and youth
          within the living tradition of the Eritrean Orthodox Tewahdo Church. We aim to equip students with knowledge
          of the Bible, church history, liturgy, Ge'ez language, and hymnology — while fostering a deep love for the
          faith and community.
        </p>
      </section>

      {/* What We Teach */}
      <section style={{ background: '#F9FAFB', padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 32 }}>What We Teach</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { title: 'Bible Studies', desc: 'Old and New Testament, with focus on Orthodox interpretation and application.' },
              { title: 'Ge\'ez Language', desc: 'The ancient liturgical language of the Ethiopian-Eritrean church.' },
              { title: 'Church History', desc: 'From the Apostolic era through the Ethiopian Orthodox tradition.' },
              { title: 'Zema (Hymnology)', desc: 'The sacred music tradition of St. Yared and Ethiopian chant.' },
              { title: 'Liturgy', desc: 'Understanding the Divine Liturgy, sacraments, and worship.' },
              { title: 'Ethics & Morality', desc: 'Living a Christian life guided by Orthodox teaching.' },
            ].map(item => (
              <div key={item.title} style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
                <h3 style={{ color: '#1E3A5F', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 16 }}>Our Community</h2>
        <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
          We are a vibrant community of students, parents, teachers, and clergy united by our shared faith
          and commitment to passing on the Orthodox tradition to the next generation. All are welcome to join us.
        </p>
      </section>
    </div>
  )
}
