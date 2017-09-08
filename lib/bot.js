/**
 * @file lib/bot.js
 *
 * Defines the bot behaviour.
 */

const moment = require('moment');
const request = require('request-promise-native');

const util = require('./util');
const tpl = require('./templating');
const env = require('./env');


const statusCodeErrors = {
  '400': "Hmm, I couldn't find it.",
  '403': "Hey, you don't have permission to see that!",
  '500': "Server error! RUN! D:",
};


const handleStatus = (statusCode) => {
  if (200 <= statusCode && statusCode < 300) {
    return { error: false, message: '' };
  }
  return { error: true, message: statusCodeErrors[statusCode] || '' };
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
    const string = tpl.render('hype.njk', Object.assign({
      now: moment(),
    }, env.hype));
    client.say(recipient, string)
  },

  async find(client, args, {recipient}) {
    if (args.length !== 1) {
      client.say(recipient, `Usage: ${env.prefix}find <user>`);
      return;
    }

    request({
      uri: tpl.renderString(env.api.latestEntry, {user: args[0]}),
      json: true,
    })
    .then(({latest_entry: e}) => `${e.title} by ${args[0]}: ${e.url}`)
    .catch(err => {
      console.log('find error:', err.message, err.stack);
      return "Hmm, something's not quite right.";
    })
    .then(msg => client.say(recipient, msg));
  }
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
