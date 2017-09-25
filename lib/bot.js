/**
 * @file lib/bot.js
 *
 * Defines the bot behaviour.
 */

const request = require('request-promise-native');
const roll = require('roll');
const get = require('lodash/get');

const util = require('./util');
const tpl = require('./templating');
const env = require('./env');
const random = require('./random');


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


const countdownURI = tpl.renderString(env.api.countdown);
const getCountdown = () => request({
  uri: countdownURI,
  json: true,
});


/**
 * Commands the bot will respond to in the channel.
 */
const messageCommands = {
  async hype(client, args, {recipient}) {
    if (args.length !== 0) {
      client.say(recipient, `Usage: ${env.prefix}hype`);
      return;
    }
    let message = '';
    try {
      message = (await getCountdown()).countdown_formatted;
    }
    catch (err) {
      message = onError(err, {args, uri: countdownURI, command: 'hype'});
    }
    client.say(recipient, message);
  },

  async panic(client, args, {recipient}) {
    if (args.length !== 0) {
      client.say(recipient, `Usage: ${env.prefix}panic`);
      return;
    }

    const messages = get(env, 'commands.panic.messages', []);
    if (messages.length === 0) {
      console.warn('No panic messages configured!');
      return Promise.reject('No panic messages');
    }

    let message = '';
    try {
      const date = (await getCountdown()).countdown_config.date;
      message = tpl.renderString(random.element(messages), {
        time: util.timeSpanToString(date),
      });
    }
    catch (err) {
      message = onError(err, {args, uri: countdownURI, command: 'panic'});
    }
    client.say(recipient, message);
  },

  find(client, args, {recipient}) {
    if (args.length !== 1) {
      client.say(recipient, `Usage: ${env.prefix}find <user>`);
      return;
    }
    const user = args[0];
    const uri = tpl.renderString(env.api.find, {user});
    request({uri, json: true})
    .then(({latest_entry: e}) => e
      ? `${e.title} by ${user}: ${e.url}`
      : `${user} has no entries!`
    )
    .catch(err => {
      if (err && err.response && err.response.statusCode === 404) {
        return `No '${user}' user`;
      }
      return onError(err, {uri, args, command: 'find'});
    })
    .then(msg => { client.say(recipient, msg); });
  },

  roll(client, args, {recipient}) {
    const query = args.join(' ').trim() || '1d6';
    for (const numberString of query.split(/[^0-9]+/)) {
      if (numberString.length > 4) {
        client.say(recipient, 'I... ran out of dice.');
        return;
      }
    }

    let message = '';
    try {
      message = new roll().roll(query).result;
    }
    catch(e) {
      message = onError(e, {args, command: 'roll'});
    }
    client.say(recipient, message);
  },
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
