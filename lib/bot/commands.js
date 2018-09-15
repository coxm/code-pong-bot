/**
 * @file lib/bot.js
 *
 * Defines the bot behaviour.
 */

const util = require('../util');
const env = require('../env');
const db = require('../db');


/**
 * Handle an error.
 *
 * @param {Error} err the error.
 * @param {Object} [extra] any extra info to be logged.
 */
const onError = (err, extra) => {
  console.error('Error:', {message: err.message, stack: err.stack, ...extra});
  return "Uh oh, something went wrong.";
};


/**
 * Commands the bot will respond to in the channel.
 */
const messageCommands = {
  async baton(client, args, {recipient}) {
    const {user, time} = await db.baton();
    client.say(
      recipient,
      user === null
        ? 'Nobody has the baton!'
        : `${user} grabbed the baton at ${time}`);
  },

  async gimme(client, args, {nick, recipient}) {
    const user = args[0] || nick;
    const result = await db.gimme({
      user,
      time: (new Date()).toISOString(),
    });
    client.say(
      recipient,
      result.success
        ? `Baton passed to ${user}!`
        : `Can't give ${user} the baton: someone already has it!`);
  },
};


/** Commands the bot will respond to in private messages. */
const pmCommands = Object.assign({}, messageCommands);


/** A regex determining valid commands and their arguments. */
const cmdRegex = new RegExp(`^${env.irc.prefix}(\\w+) ?(.*)$`);


const isChannel = (recipient) => /^[#&]/.test(recipient);
module.exports.isChannel = isChannel;


const handleEvent = (client, nick, text, recipient, commands) => {
  const cmd = util.parseCommand(
    client, env.irc, cmdRegex, nick, text, commands);
  cmd && cmd.fn(client, cmd.args, {recipient, nick});
};


/** Handle a 'message#' event. */
const channelMessage = (client, nick, to, text) => {
  handleEvent(client, nick, text, isChannel(to) ? to : nick, messageCommands);
};
module.exports.channelMessage = channelMessage;


/** Handle a 'pm' event. */
const privateMessage = (client, nick, text) => {
  handleEvent(client, nick, text, nick, pmCommands);
};
module.exports.privateMessage = privateMessage;


module.exports.listeners = {
  'message#': channelMessage,
  pm: privateMessage,
};
