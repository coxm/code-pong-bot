/**
 * @file lib/bot.js
 *
 * Defines the bot behaviour.
 */

const request = require('request-promise-native');
const roll = require('roll');

const util = require('./util');
const tpl = require('./templating');
const env = require('./env');


/**
 * Handle an error.
 *
 * @param {Error} err the error.
 * @param {Object} [extra] any extra info to be logged.
 */
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
    const uri = tpl.renderString(env.api.hype);
    request({uri: uri, json: true})
    .then(obj => obj.countdown_formatted)
    .catch(err => onError(err, {uri, args, command: 'hype'}))
    .then(msg => { client.say(recipient, msg); });
  },

  find(client, args, {recipient}) {
    if (args.length !== 1) {
      client.say(recipient, `Usage: ${env.prefix}find <user>`);
      return;
    }
    const uri = tpl.renderString(env.api.find, {user: args[0]});
    request({uri, json: true})
    .then(({latest_entry: e}) => `${e.title} by ${args[0]}: ${e.url}`)
    .catch(err => onError(err, {uri, args, command: 'find'}))
    .then(msg => { client.say(recipient, msg); });
  },

  roll(client, args, {recipient}) {
    const query = args.join(' ').trim() || '1d6';
    try {
      client.say(recipient, new roll().roll(query).result);
    }
    catch(e) {
      onError(e, {args, command: 'roll'});
      client.say(recipient, "Hmm, something's not quite right.");
    }
  }
};


/** Commands the bot will respond to in private messages. */
const pmCommands = Object.assign({}, messageCommands);


/** A regex determining valid commands and their arguments. */
const cmdRegex = new RegExp(`^${env.prefix}(\\w+) ?(.*)$`);


const isChannel = (recipient) => /^[#&]/.test(recipient);
module.exports.isChannel = isChannel;


const handleEvent = (client, nick, text, recipient, commands) => {
  const cmd = util.parseCommand(
    client, env, cmdRegex, nick, text, commands);
  cmd && cmd.fn(client, cmd.args, {recipient});
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
