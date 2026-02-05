import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/* ========= File Helpers ========= */
function readFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function getRuleCount(cat) {
  const rulesPath = path.join('skills', cat, 'rules');
  if (!fs.existsSync(rulesPath) || !fs.statSync(rulesPath).isDirectory()) {
    return null;
  }
  return fs.readdirSync(rulesPath).filter((file) => file.endsWith('.md')).length;
}

/* ========= Update Helpers ========= */
function updateDocument(filePath, categories, patternGenerator, name) {
  const content = readFile(path.resolve(filePath));
  if (!content) {
    console.log(`${filePath} not found.`);
    return;
  }

  let updatedContent = content;
  for (const cat of categories) {
    const count = getRuleCount(cat);
    if (count === null) continue;

    const pattern = patternGenerator(cat);
    if (pattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(pattern, `$1${count}$2`);
      console.log(`[${name}] Updated ${cat} count to ${count}`);
    }
  }

  if (updatedContent !== content) {
    writeFile(filePath, updatedContent);
    console.log(`${filePath} updated successfully.`);
  } else {
    console.log(`No changes needed in ${filePath}.`);
  }
}

/* ========= Main Logic ========= */
function updateCounts() {
  const categories = ['nextdns-api', 'nextdns-cli', 'nextdns-ui', 'integrations'];

  // Update README.md
  updateDocument(
    'README.md',
    categories,
    (cat) =>
      new RegExp(`(\\| \\[.*?\\]\\(skills/${cat}/SKILL\\.md\\) \\| \\*\\*)\\d+(\\*\\* \\|)`, 'g'),
    'README'
  );

  // Update AGENTS.md
  updateDocument(
    'AGENTS.md',
    categories,
    (cat) => new RegExp(`(${cat}/.*?# )\\d+( rules)`, 'g'),
    'AGENTS'
  );
}

// Run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateCounts();
}
