const moment = require('moment');


const identity = (u) => u;
module.exports.identity = identity;


const programHasOption = (...aliases) => {
  const regex = new RegExp(`^(${aliases.join('|')})$`);
  return !!process.argv.find(arg => regex.test(arg));
};
module.exports.programHasOption = programHasOption;


let cli;
if (programHasOption('-c', '--colou?r')) {
  const colors = require('cli-color');

  cli = {
    err: colors.bgRed.black,
    warn: colors.bgYellow.black,
    info: colors.bgBlueBright.black,
  };
}
else {
  cli = {
    err: identity,
    warn: identity,
    info: identity,
  };
}
module.exports.cli = cli;


/**
 * Reset all imports from a directory.
 *
 * @param {string} [dir] a directory to reset imports from. Defaults to `lib`.
 */
const resetImports = (dir = __dirname) => {
  for (const filename in require.cache) {
    if (filename.startsWith(dir)) {
      delete require.cache[filename];
    }
  }
};
module.exports.resetImports = resetImports;

/**
 * @type {ParsedCommand}
 * @prop {string} name the command name.
 * @prop {string[]} args any arguments succeeding the command.
 * @prop {Function} fn the command function.
 */

/**
 * Parse a command.
 *
 * @param {irc.Client} client the IRC client.
 * @param {Object} env the environment configuration.
 * @param {RegExp} regex the regex determining the command and arguments.
 * @param {string} from the sender.
 * @param {string} text the command text.
 * @param {Object.<string, Function>} commands the commands dict.
 * @returns {ParsedCommand|null} the parsed command or null if invalid.
 */
const parseCommand = (client, env, regex, from, text, commands) => {
  if (client.nick === from || env.admin.blockList.includes(from)) {
    return null;
  }
  const match = regex.exec(text);
  if (!match || !match[1]) {
    return null;
  }
  const name = match[1];
  const fn = commands[name];
  return !fn ? null : {
    name,
    args: match[2] ? match[2].trim().split(' ') : [],
    fn,
  };
};
module.exports.parseCommand = parseCommand;


/** Render a list of items to a comma-separated list. */
const toCommaSeparatedList = (items) => {
  if (items.length < 2) {
    return items[0];
  }
  const last = items.length - 1;
  return `${items.slice(0, last).join(', ')} and ${items[last]}`;
};
module.exports.toCommaSeparatedList = toCommaSeparatedList;


/** Steps to use when rendering timespans to human-readable output. */
const timespanSteps = [
  { seconds: 604800, singular: 'week', plural: 'weeks' },
  { seconds: 86400, singular: 'day', plural: 'days' },
  { seconds: 3600, singular: 'hour', plural: 'hours' },
  { seconds: 60, singular: 'minute', plural: 'minutes' },
  { seconds: 1, singular: 'second', plural: 'seconds' }
];
module.exports.timespanSteps = timespanSteps;


/**
 * Convert a timespan to a string.
 *
 * @param {string|Date|Moment} end the end of the timespan.
 * @param {string|Date|Moment} [begin] the beginning of the timespan.
 *
 * If `begin` is not provided, the current time is used.
 */
const timeSpanToString = (end, begin = undefined) => {
  end = moment(end).utc();
  begin = moment(begin).utc();
  let seconds = Math.floor((end - begin) / 1000);
  const fragments = [];
  for (const ts of timespanSteps) {
    const amount = Math.floor(seconds / ts.seconds);
    seconds -= amount * ts.seconds;
    if (amount !== 0) {
      fragments.push(`${amount} ${amount === 1 ? ts.singular : ts.plural}`);
    }
  }
  return toCommaSeparatedList(fragments);
};
module.exports.timeSpanToString = timeSpanToString;
