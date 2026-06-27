/**
 * Ulric-X MD - Game commands
 * Simple text-based games (Tic-Tac-Toe, Guess number, Word chain, etc.)
 */
const utils = require('../lib/utils');

// In-memory game state (per chat)
const games = new Map();

module.exports = [
  {
    name: 'tictactoe', alias: ['ttt','oxo'], category: 'game', desc: 'Tic Tac Toe game',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0];
      if (!target) return ctx.reply(`Mention a player: ${ctx.prefix}tictactoe @user`);
      if (games.has(ctx.jid)) return ctx.reply('A game is already running here');
      games.set(ctx.jid, { type: 'ttt', board: [' ',' ',' ',' ',' ',' ',' ',' ',' '], p1: ctx.sender, p2: target, turn: ctx.sender, sym: { [ctx.sender]:'X', [target]:'O' } });
      ctx.reply(`🎮 Tic Tac Toe!\nX: @${ctx.sender.split('@')[0]}\nO: @${target.split('@')[0]}\n\n${drawBoard([' ',' ',' ',' ',' ',' ',' ',' ',' '])}\n\nUse ${ctx.prefix}move 1-9\n\nTurn: @${ctx.sender.split('@')[0]} (X)`, { mentions: [ctx.sender, target] });
    }
  },
  {
    name: 'move', alias: ['place'], category: 'game', desc: 'Make a move in Tic Tac Toe',
    handler: async (ctx) => {
      const g = games.get(ctx.jid);
      if (!g || g.type !== 'ttt') return ctx.reply('No active game. Start with .tictactoe @user');
      if (g.turn !== ctx.sender) return ctx.reply('Not your turn');
      const pos = parseInt(ctx.args[0], 10);
      if (!pos || pos < 1 || pos > 9) return ctx.reply('Position 1-9 required');
      if (g.board[pos-1] !== ' ') return ctx.reply('Already taken');
      g.board[pos-1] = g.sym[ctx.sender];
      const winner = checkWin(g.board);
      if (winner) { ctx.reply(`🎉 @${ctx.sender.split('@')[0]} wins!\n\n${drawBoard(g.board)}`, { mentions: [ctx.sender] }); games.delete(ctx.jid); return; }
      if (!g.board.includes(' ')) { ctx.reply(`🤝 Draw!\n\n${drawBoard(g.board)}`); games.delete(ctx.jid); return; }
      g.turn = g.turn === g.p1 ? g.p2 : g.p1;
      ctx.reply(`${drawBoard(g.board)}\n\nTurn: @${g.turn.split('@')[0]} (${g.sym[g.turn]})`, { mentions: [g.turn] });
    }
  },
  {
    name: 'endgame', alias: ['stopgame'], category: 'game', desc: 'End current game',
    handler: async (ctx) => { games.delete(ctx.jid); ctx.reply('✅ Game ended'); }
  },
  {
    name: 'guess', alias: ['guessnumber'], category: 'game', desc: 'Guess the number game',
    handler: async (ctx) => {
      const num = utils.randInt(1, 100);
      games.set(ctx.jid + ':guess', { num, tries: 0 });
      ctx.reply('🎯 I picked a number 1-100. Use .try <number>');
    }
  },
  {
    name: 'try', alias: ['attempt'], category: 'game', desc: 'Try a guess',
    handler: async (ctx) => {
      const g = games.get(ctx.jid + ':guess');
      if (!g) return ctx.reply('No active guess game. Start with .guess');
      const n = parseInt(ctx.args[0], 10);
      if (!n) return ctx.reply('Provide a number');
      g.tries++;
      if (n === g.num) { ctx.reply(`🎉 Correct! You got it in ${g.tries} tries!`); games.delete(ctx.jid + ':guess'); }
      else if (n < g.num) ctx.reply('📈 Higher!');
      else ctx.reply('📉 Lower!');
    }
  },
  {
    name: 'trivia', alias: ['quiz'], category: 'game', desc: 'Random trivia question',
    handler: async (ctx) => {
      const ts = [
        { q: 'What is the capital of France?', a: 'paris' },
        { q: 'How many continents are there?', a: '7' },
        { q: 'What is the largest planet in our solar system?', a: 'jupiter' },
        { q: 'Who wrote Romeo and Juliet?', a: 'shakespeare' },
        { q: 'What is the chemical symbol for gold?', a: 'au' },
        { q: 'How many sides does a hexagon have?', a: '6' },
        { q: 'What is the tallest mountain in the world?', a: 'everest' },
        { q: 'In which year did World War II end?', a: '1945' },
        { q: 'What is the largest ocean on Earth?', a: 'pacific' },
        { q: 'Who painted the Mona Lisa?', a: 'davinci' }
      ];
      const t = utils.pickRandom(ts);
      games.set(ctx.jid + ':trivia', t);
      ctx.reply(`🧠 Trivia:\n${t.q}\n\nUse .answer <your answer>`);
    }
  },
  {
    name: 'answer', alias: ['ans'], category: 'game', desc: 'Answer trivia',
    handler: async (ctx) => {
      const g = games.get(ctx.jid + ':trivia');
      if (!g) return ctx.reply('No active trivia. Start with .trivia');
      if (!ctx.q) return ctx.reply('Provide an answer');
      if (ctx.q.toLowerCase().trim() === g.a.toLowerCase()) ctx.reply('✅ Correct!');
      else ctx.reply(`❌ Wrong. Answer: ${g.a}`);
      games.delete(ctx.jid + ':trivia');
    }
  },
  {
    name: 'wordchain', alias: ['wordgame','chain'], category: 'game', desc: 'Start word chain game',
    handler: async (ctx) => {
      const words = ['apple','banana','elephant','tiger','rabbit','train','nose','egg'];
      const start = utils.pickRandom(words);
      games.set(ctx.jid + ':chain', { last: start, used: [start], scores: {} });
      ctx.reply(`🔗 Word Chain!\nStarting word: *${start}*\nNext word must start with: *${start.slice(-1).toUpperCase()}*\nUse .chainword <word>`);
    }
  },
  {
    name: 'chainword', alias: ['cw'], category: 'game', desc: 'Submit word in chain game',
    handler: async (ctx) => {
      const g = games.get(ctx.jid + ':chain');
      if (!g) return ctx.reply('No active chain. Start with .wordchain');
      const w = (ctx.q || '').toLowerCase().trim();
      if (!w) return ctx.reply('Provide a word');
      if (w[0] !== g.last.slice(-1)) return ctx.reply(`❌ Must start with '${g.last.slice(-1).toUpperCase()}'`);
      if (g.used.includes(w)) return ctx.reply('❌ Already used');
      g.used.push(w); g.last = w;
      g.scores[ctx.sender] = (g.scores[ctx.sender] || 0) + 1;
      ctx.reply(`✅ Accepted: *${w}*\nNext letter: *${w.slice(-1).toUpperCase()}*\nScore: ${g.scores[ctx.sender]}`);
    }
  },
  {
    name: 'rps', alias: ['rockpaperscissors'], category: 'game', desc: 'Rock Paper Scissors',
    handler: async (ctx) => {
      const choice = (ctx.args[0] || '').toLowerCase();
      if (!['rock','paper','scissors'].includes(choice)) return ctx.reply(`Example: ${ctx.prefix}rps rock`);
      const bot = utils.pickRandom(['rock','paper','scissors']);
      let r;
      if (choice === bot) r = 'Draw';
      else if ((choice==='rock'&&bot==='scissors')||(choice==='paper'&&bot==='rock')||(choice==='scissors'&&bot==='paper')) r = 'You win!';
      else r = 'You lose!';
      ctx.reply(`🤜 You: ${choice}\n🤖 Bot: ${bot}\n${r}`);
    }
  },
  {
    name: 'mathgame', alias: ['mg'], category: 'game', desc: 'Quick math game',
    handler: async (ctx) => {
      const a = utils.randInt(1,50), b = utils.randInt(1,50), op = utils.pickRandom(['+','-','*']);
      const ans = op === '+' ? a+b : op === '-' ? a-b : a*b;
      games.set(ctx.jid + ':math', { ans });
      ctx.reply(`🧮 What is ${a} ${op} ${b}?\nUse .mathans <answer>`);
    }
  },
  {
    name: 'mathans', alias: ['ma'], category: 'game', desc: 'Answer math game',
    handler: async (ctx) => {
      const g = games.get(ctx.jid + ':math');
      if (!g) return ctx.reply('No active math. Start with .mathgame');
      const a = parseInt(ctx.args[0], 10);
      if (a === g.ans) ctx.reply('✅ Correct!');
      else ctx.reply(`❌ Wrong. Answer: ${g.ans}`);
      games.delete(ctx.jid + ':math');
    }
  },
  {
    name: 'hangman', alias: ['hm'], category: 'game', desc: 'Hangman game',
    handler: async (ctx) => {
      const words = ['javascript','whatsapp','programming','internet','computer','developer','keyboard','monitor','algorithm','database','network','security','python','react','nodejs'];
      const w = utils.pickRandom(words);
      games.set(ctx.jid + ':hangman', { word: w, guessed: new Set(), wrong: 0 });
      ctx.reply(`🪢 Hangman!\nWord: ${'_ '.repeat(w.length)}\nWrong guesses left: 6\nUse .guessletter <letter>`);
    }
  },
  {
    name: 'guessletter', alias: ['gl'], category: 'game', desc: 'Guess a letter in hangman',
    handler: async (ctx) => {
      const g = games.get(ctx.jid + ':hangman');
      if (!g) return ctx.reply('No active hangman');
      const l = (ctx.args[0] || '').toLowerCase();
      if (!l || l.length !== 1) return ctx.reply('One letter only');
      if (g.guessed.has(l)) return ctx.reply('Already guessed');
      g.guessed.add(l);
      if (!g.word.includes(l)) { g.wrong++; }
      let display = g.word.split('').map(c => g.guessed.has(c) ? c : '_').join(' ');
      if (!display.includes('_')) { ctx.reply(`🎉 You won! Word: ${g.word}`); games.delete(ctx.jid + ':hangman'); return; }
      if (g.wrong >= 6) { ctx.reply(`💀 Game over! Word: ${g.word}`); games.delete(ctx.jid + ':hangman'); return; }
      ctx.reply(`Word: ${display}\nWrong left: ${6-g.wrong}\nGuessed: ${[...g.guessed].join(', ')}`);
    }
  },
  {
    name: 'coinflipgame', alias: ['cfg'], category: 'game', desc: 'Coin flip streak game',
    handler: async (ctx) => {
      let streak = 0;
      const choice = (ctx.args[0] || '').toLowerCase();
      if (!['heads','tails'].includes(choice)) return ctx.reply(`Example: ${ctx.prefix}cfg heads`);
      const r = utils.pickRandom(['heads','tails']);
      if (r === choice) streak = 1;
      ctx.reply(`🪙 ${r.toUpperCase()}\n${r === choice ? '✅ You won this round!' : '❌ You lost'}`);
    }
  }
];

function drawBoard(b) {
  return `\`\`\`\n ${b[0]} | ${b[1]} | ${b[2]}\n-----------\n ${b[3]} | ${b[4]} | ${b[5]}\n-----------\n ${b[6]} | ${b[7]} | ${b[8]}\n\`\`\``;
}
function checkWin(b) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(w => b[w[0]] !== ' ' && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]);
}
