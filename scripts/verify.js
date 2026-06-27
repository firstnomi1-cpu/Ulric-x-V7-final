/**
 * Quick syntax + command count verification script
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'commands');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
const commands = new Map();
const categories = new Map();
let total = 0;
const errors = [];

for (const f of files) {
  try {
    delete require.cache[path.join(dir, f)];
    const mod = require(path.join(dir, f));
    if (!Array.isArray(mod)) { errors.push(`${f}: not an array`); continue; }
    let fileCount = 0;
    for (const cmd of mod) {
      if (!cmd || !cmd.name || typeof cmd.handler !== 'function') {
        errors.push(`${f}: invalid cmd entry`);
        continue;
      }
      const names = [cmd.name, ...(cmd.alias || [])].map(s => String(s).toLowerCase());
      for (const n of names) {
        if (!commands.has(n)) commands.set(n, cmd);
      }
      const cat = cmd.category || 'misc';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push(cmd);
      total++;
      fileCount++;
    }
    console.log(`✓ ${f}: ${fileCount} commands`);
  } catch (e) {
    errors.push(`${f}: ${e.message}`);
  }
}

console.log('\n═══════════════════════════════════════');
console.log(`  Total commands: ${total}`);
console.log(`  Unique names (incl. aliases): ${commands.size}`);
console.log(`  Categories: ${categories.size}`);
console.log('═══════════════════════════════════════\n');

console.log('Category breakdown:');
for (const [cat, cmds] of categories) {
  console.log(`  ${cat.padEnd(12)} ${cmds.length} commands`);
}

if (errors.length) {
  console.log('\n❌ Errors:');
  errors.forEach(e => console.log('  - ' + e));
  process.exit(1);
} else {
  console.log('\n✅ All command files loaded successfully!');
}

// Also test that core modules load
try {
  require('../config');
  require('../lib/utils');
  require('../lib/store');
  require('../lib/menu');
  require('../handler');
  console.log('✅ Core modules load OK');
} catch (e) {
  console.log('❌ Core module error:', e.message);
  process.exit(1);
}

console.log(`\n🎯 Result: ${total >= 1000 ? '✅ 1000+ commands achieved!' : '❌ Need more commands (' + total + ')'}`);
