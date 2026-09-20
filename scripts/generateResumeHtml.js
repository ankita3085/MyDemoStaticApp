const fs = require('fs');
const path = require('path');
const dataPath = path.join(process.cwd(),'data','resume.json');
if(!fs.existsSync(dataPath)){ console.error('data/resume.json not found. Run parse-resume first.'); process.exit(1);} 
const data = JSON.parse(fs.readFileSync(dataPath,'utf8'));
const out = [];
out.push(`<!doctype html>`);
out.push(`<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${data.name} — Resume</title><link rel="stylesheet" href="css/style.css"/></head><body>`);
out.push(`<header class="site-header"><div class="container header-inner"><div class="brand"><a href="index.html">${data.name}</a></div></div></header>`);
out.push(`<main class="container"><article class="card"><h1>${data.name}</h1><p><strong>Contact:</strong> ${data.contact.email || ''} ${data.contact.phone? ' | ' + data.contact.phone : ''}</p>`);
if(data.summary) out.push(`<section><h2>Summary</h2><p>${data.summary.replace(/\n/g,'<br/>')}</p></section>`);
if(data.skills && data.skills.length){ out.push('<section><h2>Skills</h2><ul>'); data.skills.slice(0,60).forEach(s=> out.push(`<li>${s}</li>`)); out.push('</ul></section>'); }
if(data.experience){ out.push(`<section><h2>Experience</h2><pre style="white-space:pre-wrap">${data.experience}</pre></section>`); }
if(data.education){ out.push(`<section><h2>Education</h2><pre>${data.education}</pre></section>`); }
out.push(`</article></main><footer class="site-footer"><div class="container"><p>Generated resume HTML</p></div></footer></body></html>`);

fs.writeFileSync(path.join(process.cwd(),'resume.html'), out.join('\n'));
fs.mkdirSync(path.join(process.cwd(),'build'), {recursive:true});
fs.writeFileSync(path.join(process.cwd(),'build','resume.html'), out.join('\n'));
console.log('Generated resume.html in repo root and build/');
