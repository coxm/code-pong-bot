/**
 * @file lib/bot.js
 *
 * Defines the bot behaviour.
 */

const moment = require('moment');
const request = require('request-promise-native');
const roll = require('roll');

const util = require('./util');
const tpl = require('./templating');
const env = require('./env');


const onError = (err, extra) => {
  console.error('Error:', {message: err.message, stack: err.stack, ...extra});
  return "Hmm, something's not quite right...";
};


/**
 * Commands the bot will respond to in the channel.
 */
const messageCommands = {
  hype(client, args, {recipient}) {
    if (args.length !== 0) {
      client.say(recipient, `Usage: ${env.prefix}hype`);
      return;
    }
    request({
      uri: tpl.renderString(env.api.hype),
      json: true,
    })
    .then(obj => obj.countdown_formatted)
    .catch(err => onError(err, {uri, args, command: 'hype'}))
    .then(msg => client.say(recipient, msg));
  },

  find(client, args, {recipient}) {
    if (args.length !== 1) {
      client.say(recipient, `Usage: ${env.prefix}find <user>`);
      return;
    }
    request({
      uri: tpl.renderString(env.api.find, {user: args[0]}),
      json: true,
    })
    .then(({latest_entry: e}) => `${e.title} by ${args[0]}: ${e.url}`)
    .catch(err => onError(err, {uri, args, command: 'find'}))
    .then(msg => client.say(recipient, msg));
  },

  roll(client, args, {recipient}) {
    let query = args.join(' ').trim() || '1d6';
    try {
      client.say(recipient, new roll().roll(query).result);
    } catch(e) {
      console.error(e);
      client.say(recipient, "Hmm, something's not quite right.");
    }
  }
};


/**
 * Commands the bot will respond to in private messages.
 */
// const pmCommands = {
// };


/** A regex determining valid commands and their arguments. */
const cmdRegex = new RegExp(`^${env.prefix}(\\w+) ?(.*)$`);


const isChannel = (recipient) => /^[#&]/.test(recipient);
module.exports.isChannel = isChannel;


const message = (client, nick, to, text) => {
  const cmd = util.parseCommand(
    client, env, cmdRegex, nick, text, messageCommands);
  if (cmd) {
    cmd.fn(client, cmd.args, {
      recipient: isChannel(to) ? to : nick,
    });
  }
};
module.exports.message = message;


module.exports.listeners = {
  message,
};
