const fs = require('fs');
const path = require('path');

const pages = [
  { route: 'category/[slug]', title: 'Category Details' },
  { route: 'product/[id]', title: 'Product Details' },
  { route: 'search', title: 'Search Results' },
  { route: 'cart', title: 'Your Shopping Cart' },
  { route: 'checkout', title: 'Checkout' },
  { route: 'seller/dashboard', title: 'Seller Dashboard' },
  { route: 'wishlist', title: 'Your Wishlist' },
  { route: 'prime', title: 'MARKATVERSE PRIME' },
  { route: 'b2b', title: 'B2B Trade Center' },
  { route: 'c2c', title: 'C2C Zone' }
];

const basePath = path.join(__dirname, 'src', 'app');

pages.forEach(p => {
  const dirPath = path.join(basePath, p.route);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const content = `export default function Page() {
  return (
    <div style={{ padding: '40px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>${p.title}</h1>
      <div style={{ padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>This page is functional and ready for data integration.</p>
        <br/>
        <a href="/" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Home</a>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
  console.log(`Created ${p.route}/page.tsx`);
});
