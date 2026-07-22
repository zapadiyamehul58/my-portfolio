const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'admin', 'Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace border-slate-800/80 and border-slate-800
content = content.replace(/border-slate-800\/80/g, 'border-white/5');
content = content.replace(/border-slate-800/g, 'border-white/5');

// Improve background glassmorphism
content = content.replace(/bg-slate-950/g, 'bg-[#151822]/80 backdrop-blur');
content = content.replace(/bg-slate-900\/40/g, 'bg-[#0f111a]/60 backdrop-blur-md');
content = content.replace(/bg-slate-900/g, 'bg-[#0f111a]/60 backdrop-blur-md');

// Add shadows
content = content.replace(/shadow-xl/g, 'shadow-[0_0_30px_rgba(99,102,241,0.1)]');
content = content.replace(/shadow-2xl/g, 'shadow-[0_0_50px_rgba(14,165,233,0.1)]');

fs.writeFileSync(file, content);
console.log('Done!');
