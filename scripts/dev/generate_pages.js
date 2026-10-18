const fs = require('fs');
const path = require('path');

const sidebarPath = path.join('d:', 'MarkatVerse', 'frontend', 'src', 'app', 'admin', 'components', 'Sidebar.tsx');
const content = fs.readFileSync(sidebarPath, 'utf8');

// Regex to find all hrefs in the sidebar
const hrefRegex = /href:\s*'(\/admin\/[^']+)'/g;
const links = [];
let match;
while ((match = hrefRegex.exec(content)) !== null) {
  links.push(match[1]);
}

const baseDir = path.join('d:', 'MarkatVerse', 'frontend', 'src', 'app');

const template = (title) => `
export default function Page() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">${title}</h1>
        <p className="text-slate-400 mt-2 text-sm">Manage and configure ${title.toLowerCase()}.</p>
      </header>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-8 text-center">
        <p className="text-slate-400">This module is currently under construction.</p>
      </div>
    </div>
  );
}
`;

let created = 0;
links.forEach(link => {
  // link is like /admin/users/customers
  // map to app/admin/users/customers/page.tsx
  const relativePath = link.replace(/^\//, ''); // remove leading slash
  const fullDirPath = path.join(baseDir, relativePath);
  const fullFilePath = path.join(fullDirPath, 'page.tsx');
  
  if (!fs.existsSync(fullFilePath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });
    
    // Extract title from link, e.g. /admin/users/customers -> Users > Customers
    const parts = link.split('/').filter(Boolean).slice(1); // skip 'admin'
    const title = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')).join(' > ');
    
    fs.writeFileSync(fullFilePath, template(title));
    created++;
  }
});

console.log('Created ' + created + ' placeholder pages.');
