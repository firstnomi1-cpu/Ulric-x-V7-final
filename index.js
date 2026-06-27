/**
 * Ulric-X MD FINAL - Main entry point
 *
 * Owner   : ULRIC X SHAH
 * Number  : 923189335011
 * Version : 5.0 (FINAL - Production Ready)
 */
require('dotenv').config();
const chalk = require('chalk');
const config = require('./config');
const utils  = require('./lib/utils');
const handler= require('./handler');
const pairMgr= require('./pair');
const { startServer } = require('./server');

(async () => {
  try {
    console.clear();
    try { console.log(chalk.cyan(utils.banner())); } catch {}
    console.log(chalk.yellow('═══════════════════════════════════════════════'));
    console.log(chalk.green(`   ${config.BOT_NAME}  -  FINAL v${config.BOT_VERSION}`));
    console.log(chalk.green(`   Owner  : ${config.BOT_OWNER}`));
    console.log(chalk.green(`   Number : ${config.BOT_OWNER_NUM}`));
    console.log(chalk.yellow('═══════════════════════════════════════════════\n'));

    // 1) Load all commands
    const { total, categories } = handler.loadCommands();
    console.log(chalk.green(`[BOOT] ${total} commands loaded in ${categories} categories.`));

    // 2) Start web panel
    startServer(config.PORT);

    // 3) Auto-load all paired sessions (after small delay)
    setTimeout(async () => {
      try {
        await pairMgr.autoLoadAllPaired((i, n, jid) => {
          console.log(chalk.blue(`[AUTOLOAD] ${i}/${n}  ${jid}`));
        });
      } catch (e) {
        console.error(chalk.red('[AUTOLOAD] ' + e.message));
      }
    }, 3000);

    // 4) Periodic keep-alive log
    setInterval(() => {
      const mem = process.memoryUsage();
      console.log(chalk.gray(`[PING] ${new Date().toISOString()} | rss=${utils.formatBytes(mem.rss)} | conns=${pairMgr.getAllConnections().length} | cmds=${handler.getTotalCommands()}`));
    }, 5 * 60 * 1000);

    // 5) Graceful error handlers
    process.on('unhandledRejection', (r) => {
      const ignored = ['Socket connection timeout','EKEYTYPE','item-not-found','rate-overlimit','Connection Closed','Timed Out','Value not found'];
      if (ignored.some(s => String(r).includes(s))) return;
      console.error(chalk.red('[unhandledRejection]'), r);
    });
    process.on('uncaughtException', (e) => {
      const ignored = ['Socket connection timeout','EKEYTYPE','item-not-found','rate-overlimit','Connection Closed','Timed Out','Value not found'];
      if (ignored.some(s => String(e?.message || e).includes(s))) return;
      console.error(chalk.red('[uncaughtException]'), e);
    });

    console.log(chalk.green(`\n[BOOT] ${config.BOT_NAME} FINAL is up. Web panel → http://0.0.0.0:${config.PORT}\n`));
  } catch (e) {
    console.error(chalk.red('[BOOT FATAL] ' + e.message));
    console.error(e.stack);
    process.exit(1);
  }
})();
