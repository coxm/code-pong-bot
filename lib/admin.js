const env = require('./env');
const util = require('./util');
const reload = require('./reload');


/**
 * @file lib/admin.js
 *
 * Defines admin-only commands and command parsing.
 */

/**
 * Commands which can be executed only by admins.
 *
 * @type {Object.<string, util.CommandFunc>}
 */
const commands = {
  /** Reload everything in `/lib/` and re-apply to the IRC client. */
  reload(client) {
    console.log(util.cli.info('Reloading...'));
    reload.reload(client);
    console.log(util.cli.info('Reloaded'));
  },
};
module.exports.commands = commands;


/** A regex for checking admin commands. */
const cmdRegex = new RegExp(
  `^${env.prefix}${env.prefix}${env.admin.password} (\\w+) ?(.*)$`);


module.exports.listeners = {
  pm(client, from, text) {
    const cmd = util.parseCommand(this, env, cmdRegex, from, text, commands);
    if (cmd) {
      cmd.fn(client, env, cmd.args);
    }
  },
};
