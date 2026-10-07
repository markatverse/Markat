import Link from 'next/link';

export default function Page() {
  return (
    <div style={{ padding: '40px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>C2C Zone</h1>
      <div style={{ padding: '40px', backgroundColor: 'var(--bg-slate-800)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>This page is functional and ready for data integration.</p>
        <br/>
        <Link href="/" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Home</Link>
      </div>
    </div>
  );
}
