/**
 * @file lib/bot.js
 *
 * Defines the bot behaviour.
 */

const moment = require('moment');

const util = require('./util');
const tpl = require('./templating');
const env = require('./env');


/**
 * Commands the bot will respond to in the channel.
 */
const messageCommands = {
  hype(client, { recipient }) {
    const string = tpl.render('hype.njk', Object.assign({
      now: moment(),
    }, env.hype));
    client.say(recipient, string)
  },
};


/**
 * Commands the bot will respond to in private messages.
 */
const pmCommands = {
};


/** A regex determining valid commands and their arguments. */
const cmdRegex = new RegExp(`^${env.prefix}(\\w+) ?(.*)$`);


const isChannel = (recipient) => /^[#&]/.test(recipient);
module.exports.isChannel = isChannel;


const message = (client, nick, to, text, messageObject) => {
  const cmd = util.parseCommand(
    client, env, cmdRegex, nick, text, messageCommands);
  console.log('message', nick, to, text, 'command', cmd);
  if (cmd) {
    cmd.fn(client, {
      recipient: isChannel(to) ? to : nick,
    });
  }
};
module.exports.message = message;


module.exports.listeners = {
  message,
};
