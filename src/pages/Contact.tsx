// src/pages/Contact.tsx
export default function Contact() {
  return (
    <div style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)', padding: '80px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 42, marginBottom: 8 }}>Contact Us</h1>
        <p style={{ fontSize: 18, color: '#C9A84C' }}>We'd love to hear from you</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {/* Visit Us */}
          <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <h3 style={{ color: '#1E3A5F', fontSize: 20, fontFamily: 'Cormorant Garamond, serif', marginBottom: 12 }}>Visit Us</h3>
            <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
              Eritrean Orthodox Tewahdo Church<br />
              123 Church Street<br />
              City, State ZIP
            </p>
          </div>

          {/* Service Times */}
          <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <h3 style={{ color: '#1E3A5F', fontSize: 20, fontFamily: 'Cormorant Garamond, serif', marginBottom: 12 }}>Service Times</h3>
            <div style={{ color: '#6B7280', lineHeight: 1.8 }}>
              <p><strong style={{ color: '#1E3A5F' }}>Sunday Liturgy:</strong> 8:00 AM – 11:00 AM</p>
              <p><strong style={{ color: '#1E3A5F' }}>Sunday School:</strong> 9:00 AM – 10:30 AM</p>
              <p><strong style={{ color: '#1E3A5F' }}>Wednesday Bible Study:</strong> 6:00 PM – 7:30 PM</p>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <h3 style={{ color: '#1E3A5F', fontSize: 20, fontFamily: 'Cormorant Garamond, serif', marginBottom: 12 }}>Get in Touch</h3>
            <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
              <strong style={{ color: '#1E3A5F' }}>Email:</strong> school@saintmarychurch.org<br />
              <strong style={{ color: '#1E3A5F' }}>Phone:</strong> (555) 123-4567
            </p>
          </div>
        </div>

        {/* Map placeholder */}
        <div style={{ marginTop: 48, padding: 40, borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: 16 }}>🗺️ Map will be embedded here</p>
        </div>
      </div>
    </div>
  )
}
