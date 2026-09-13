// Trekk ut tabellinnhald frå ei .docx-fil som reine tekst-rader (celler skilt med tab, rader med linjeskift).
// Bruk: node extract-docx-table.cjs "sti/til/fil.docx"
// Krev berre 'unzip' (følgjer med Git Bash) — ingen andre avhengigheiter.
const { execFileSync } = require('child_process');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Bruk: node extract-docx-table.cjs <fil.docx>'); process.exit(1); }

const xml = execFileSync('unzip', ['-p', path.resolve(file), 'word/document.xml'], { maxBuffer: 1024 * 1024 * 20 }).toString('utf8');

function textOf(fragment) {
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  let out = '', m;
  while ((m = re.exec(fragment)) !== null) {
    out += m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  }
  return out.trim();
}

const rows = xml.split(/<w:tr\b/).slice(1).map(chunk => {
  const rowXml = chunk.split(/<\/w:tr>/)[0];
  const cells = [];
  const cellRe = /<w:tc>([\s\S]*?)<\/w:tc>/g;
  let cm;
  while ((cm = cellRe.exec(rowXml)) !== null) cells.push(textOf(cm[1]));
  return cells;
});

console.log(rows.map(r => r.join('\t')).join('\n'));
