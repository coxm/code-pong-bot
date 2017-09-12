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
 * @returns {ParsedAdminCommand|null} the parsed command or null if invalid.
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
