const mammoth = require('mammoth');
const fs = require('fs');

const filePath = 'updated one Ankita-.Net.docx';

function extractSections(lines) {
  const sections = {};
  let current = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const up = line.toUpperCase();
    if (/^(SUMMARY|PROFILE|ABOUT|OBJECTIVE|PROFESSIONAL SUMMARY)$/.test(up)) { current = 'summary'; sections[current] = ''; continue; }
    if (/^(SKILLS|TECHNICAL SKILLS|TECH SKILLS)$/.test(up)) { current = 'skills'; sections[current] = ''; continue; }
    if (/^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)$/.test(up)) { current = 'experience'; sections[current] = (sections[current]||'') + '\n'; continue; }
    if (/^(PROJECTS|SELECTED PROJECTS)$/.test(up)) { current = 'projects'; sections[current] = ''; continue; }
    if (/^(EDUCATION)$/.test(up)) { current = 'education'; sections[current] = ''; continue; }
    if (/^(CONTACT|CONTACT INFO)$/.test(up)) { current = 'contact'; sections[current] = ''; continue; }

    if (current) {
      sections[current] += line + '\n';
    } else {
      // accumulate potential header or name if first lines
      sections._head = (sections._head || '') + line + '\n';
    }
  }
  return sections;
}

mammoth.extractRawText({path: filePath})
  .then(result => {
    const text = result.value;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // heuristics
    const firstLine = lines[0] || '';
    let name = firstLine;
    // try find email and phone
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = text.match(/(\+?\d[\d \-()]{6,}\d)/);

    const sections = extractSections(text.split(/\r?\n/));

    // skills: split by commas or newlines
    let skills = [];
    if (sections.skills) {
      skills = sections.skills.split(/[\n,\\•\-–]+/).map(s=>s.trim()).filter(Boolean);
    } else {
      // fallback: search for Skills inline
      const skillsLine = lines.find(l => /skills?/i.test(l));
      if (skillsLine) skills = skillsLine.split(/:|\-|–|,|;/).slice(1).join(',').split(',').map(s=>s.trim()).filter(Boolean);
    }

    // experience: keep as block
    const experience = (sections.experience||'').trim();
    const projects = (sections.projects||'').trim();
    const education = (sections.education||'').trim();
    const summary = (sections.summary||'').trim();

    const contact = {
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : ''
    };

    const out = {
      name: name,
      summary: summary,
      skills: skills,
      experience: experience,
      projects: projects,
      education: education,
      contact: contact,
      rawTextPreview: lines.slice(0,30).join('\n')
    };

    fs.mkdirSync('data', {recursive:true});
    fs.writeFileSync('data/resume.json', JSON.stringify(out, null, 2));
    console.log('Wrote data/resume.json');
  })
  .catch(err => {
    console.error('Error extracting docx:', err);
    process.exit(1);
  });
