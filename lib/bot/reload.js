const util = require('../util');
const HandlerManager = require('./HandlerManager').HandlerManager;


/** A symbol under which some data is stored on the client. */
const managerKey = Symbol.for('EventManager');
module.exports.symListeners = managerKey;


/**
 * Reload the bot for an IRC client.
 *
 * @param {irc.Client} client
 */
const reload = (client) => {
  client.on('error', (err) => {
    console.log(util.cli.err('error'), err.message, '\n', err.stack);
  });

  util.resetImports();

  let handlers = client[managerKey];
  if (handlers) {
    handlers.removeAll(client);
  }
  handlers = client[managerKey] = new HandlerManager();

  const commands = require('./commands');
  for (const event in commands.listeners) {
    handlers.add(client, event, commands.listeners[event], commands, 'bot');
  }

  const admin = require('./admin');
  for (const event in admin.listeners) {
    handlers.add(client, event, admin.listeners[event], admin, 'bot');
  }
};
module.exports.reload = reload;
