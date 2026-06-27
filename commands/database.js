/**
 * Ulric-X MD - Database commands (user preferences, notes, todos, etc.)
 */
const utils = require('../lib/utils');
const store = require('../lib/store');

module.exports = [
  {
    name: 'setnote', alias: ['savenote'], category: 'database', desc: 'Save a personal note',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setnote Buy milk tomorrow`);
      const notes = store.getSetting(`notes_${ctx.sender}`, []);
      notes.push({ text: ctx.q, ts: Date.now() });
      store.setSetting(`notes_${ctx.sender}`, notes);
      ctx.reply(`✅ Note saved (${notes.length} total)`);
    }
  },
  {
    name: 'notes', alias: ['mynotes'], category: 'database', desc: 'List your notes',
    handler: async (ctx) => {
      const notes = store.getSetting(`notes_${ctx.sender}`, []);
      if (!notes.length) return ctx.reply('No notes');
      let t = `╭━━❖ 𝐘𝐎𝐔𝐑 𝐍𝐎𝐓𝐄𝐒 (${notes.length}) ❖━┈⊷\n`;
      notes.forEach((n, i) => t += `┃│ ${i+1}. ${n.text}\n`);
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'delnote', alias: ['removenote'], category: 'database', desc: 'Delete a note',
    handler: async (ctx) => {
      const idx = parseInt(ctx.args[0], 10) - 1;
      const notes = store.getSetting(`notes_${ctx.sender}`, []);
      if (idx < 0 || idx >= notes.length) return ctx.reply('Invalid index');
      notes.splice(idx, 1);
      store.setSetting(`notes_${ctx.sender}`, notes);
      ctx.reply('✅ Deleted');
    }
  },
  {
    name: 'settodo', alias: ['addtodo'], category: 'database', desc: 'Add a todo',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}settodo Finish project`);
      const todos = store.getSetting(`todos_${ctx.sender}`, []);
      todos.push({ text: ctx.q, done: false, ts: Date.now() });
      store.setSetting(`todos_${ctx.sender}`, todos);
      ctx.reply(`✅ Todo added (${todos.length})`);
    }
  },
  {
    name: 'todo', alias: ['mytodo','todos'], category: 'database', desc: 'List todos',
    handler: async (ctx) => {
      const todos = store.getSetting(`todos_${ctx.sender}`, []);
      if (!todos.length) return ctx.reply('No todos');
      let t = `╭━━❖ 𝐘𝐎𝐔𝐑 𝐓𝐎𝐃𝐎𝐒 (${todos.length}) ❖━┈⊷\n`;
      todos.forEach((todo, i) => t += `┃│ ${i+1}. ${todo.done ? '✅' : '⬜'} ${todo.text}\n`);
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'donetodo', alias: ['tododone'], category: 'database', desc: 'Mark todo as done',
    handler: async (ctx) => {
      const idx = parseInt(ctx.args[0], 10) - 1;
      const todos = store.getSetting(`todos_${ctx.sender}`, []);
      if (idx < 0 || idx >= todos.length) return ctx.reply('Invalid index');
      todos[idx].done = true;
      store.setSetting(`todos_${ctx.sender}`, todos);
      ctx.reply('✅ Marked as done');
    }
  },
  {
    name: 'deltodo', alias: ['removetodo'], category: 'database', desc: 'Delete a todo',
    handler: async (ctx) => {
      const idx = parseInt(ctx.args[0], 10) - 1;
      const todos = store.getSetting(`todos_${ctx.sender}`, []);
      if (idx < 0 || idx >= todos.length) return ctx.reply('Invalid index');
      todos.splice(idx, 1);
      store.setSetting(`todos_${ctx.sender}`, todos);
      ctx.reply('✅ Deleted');
    }
  },
  {
    name: 'setbio2', alias: ['setmybio'], category: 'database', desc: 'Set your bot bio',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setbio2 I love coding`);
      store.setSetting(`bio_${ctx.sender}`, ctx.q);
      ctx.reply('✅ Bio saved');
    }
  },
  {
    name: 'mybio', alias: ['getbio2'], category: 'database', desc: 'View your bio',
    handler: async (ctx) => {
      const bio = store.getSetting(`bio_${ctx.sender}`, null);
      ctx.reply(bio ? `📝 ${bio}` : 'No bio set. Use .setbio2');
    }
  },
  {
    name: 'setmood', alias: ['mood'], category: 'database', desc: 'Set your mood',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setmood Happy`);
      store.setSetting(`mood_${ctx.sender}`, ctx.q);
      ctx.reply(`✅ Mood set: ${ctx.q}`);
    }
  },
  {
    name: 'mymood', alias: ['getmood'], category: 'database', desc: 'View your mood',
    handler: async (ctx) => {
      const m = store.getSetting(`mood_${ctx.sender}`, null);
      ctx.reply(m ? `🎭 Your mood: ${m}` : 'No mood set');
    }
  },
  {
    name: 'setreminder2', alias: ['reminder2'], category: 'database', desc: 'Save a reminder (basic)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setreminder2 Call mom`);
      const r = store.getSetting(`reminders_${ctx.sender}`, []);
      r.push({ text: ctx.q, ts: Date.now() });
      store.setSetting(`reminders_${ctx.sender}`, r);
      ctx.reply('✅ Reminder saved');
    }
  },
  {
    name: 'reminders', alias: ['myreminders'], category: 'database', desc: 'List reminders',
    handler: async (ctx) => {
      const r = store.getSetting(`reminders_${ctx.sender}`, []);
      if (!r.length) return ctx.reply('No reminders');
      let t = `╭━━❖ 𝐑𝐄𝐌𝐈𝐍𝐃𝐄𝐑𝐒 (${r.length}) ❖━┈⊷\n`;
      r.forEach((x, i) => t += `┃│ ${i+1}. ${x.text}\n`);
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'delreminder', alias: [], category: 'database', desc: 'Delete reminder',
    handler: async (ctx) => {
      const idx = parseInt(ctx.args[0], 10) - 1;
      const r = store.getSetting(`reminders_${ctx.sender}`, []);
      if (idx < 0 || idx >= r.length) return ctx.reply('Invalid');
      r.splice(idx, 1);
      store.setSetting(`reminders_${ctx.sender}`, r);
      ctx.reply('✅ Deleted');
    }
  }
];
