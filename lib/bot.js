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


/**
 * Commands the bot will respond to in the channel.
 */
const messageCommands = {
  async timeleft(client, args, {recipient}) {
    if (args.length !== 0) {
      client.say(recipient, `Usage: ${env.prefix}hype`);
      return;
    }
    let message = '';
    try {
      const result = await request({uri: env.api.timeleft, json: true});
      message = result.countdown_formatted ||
        "Couldn't get countdown; is there even an event?";
    }
    catch (err) {
      message = onError(err, {args, command: 'hype'});
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
      const result = await request({uri: env.api.timeleft, json: true});
      const date = result.countdown_config.date;
      message = date ?  tpl.renderString(random.element(messages), {
        time: util.timeSpanToString(date),
      }) : 'The event is over! Panic! :U';
    }
    catch (err) {
      message = onError(err, {args, command: 'panic'});
    }
    client.say(recipient, message);
  },

  async theme(client, args, {recipient}) {
    let message = "Hmm, something's not quite right...";
    try {
      const result = await request({uri: env.api.theme, json: true});
      switch (result.status_theme) {
        case 'disabled':
          message = 'Themes are disabled!';
          break;
        case 'off':
          message = 'Themes are off!';
          break;
        case 'voting':
          message = 'Theme voting is still open. Go vote!';
          break;
        case 'shortlist':
          message = 'The theme shortlist is out! See www.alakajam.com' +
            result.countdown_config.link;
          break;
        case 'closed':
          message = 'Cheeky! Themes will be announced soon.';
          break;
        case 'results':
          message = `The theme is: ${result.display_theme}`;
          break;
      }
    }
    catch (err) {
      message = onError(err, {args, command: 'theme'});
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

  async random(client, args, {recipient}) {
    if (args.length !== 0) {
      client.say(recipient, `Usage: ${env.prefix}random`);
      return;
    }
    let message = '';
    try {
      const result = await request({uri: env.api.random, json: true});
      if (result.status === 'pending') {
        const template = get(env, 'commands.random.pending',
          '{{event.title}} has not started yet');
        message = tpl.renderString(template, {
          'event': result
        });
      }
      else if (result.entries && result.entries.length > 0) {
        const entry = random.element(result.entries);
        const template = get(env, 'commands.random.entry',
          'Random entry for {{event.title}}: {{entry.title}} (entry id {{entry.id}})');
        message = tpl.renderString(template, {
          'event': result,
          'entry': entry
        });
      } else if (result.entries && result.entries.length === 0) {
        const template = get(env, 'commands.random.empty',
          'No entries for {{event.title}}');
        message = tpl.renderString(template, {
          'event': result
        });
      }
    }
    catch (err) {
      message = onError(err, {args, command: 'random'});
    }
    client.say(recipient, message);
  },
};

// Temporary alias until we can resolve:
// https://github.com/alakajam-team/alakajam-irc/issues/7
messageCommands.hype = messageCommands.timeleft;


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
