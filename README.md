# Code Pong Bot
An IRC bot and HTTP server for code pong. Forked from
[alakajam-irc](https://github.com/alakajam-team/alakajam-irc).

## Supported commands
See the [specification document](./spec/README.md).

## Quick start
Create a configuration file, `config.json`, analogous to `example.config.json`
(`config.json` is _not_ tracked by Git).

Set up a Postgres database and a user with access to the database using
credentials from the `config.json`.

The bot and server can then be started by running:

    npm run postdeploy
    npm start

The bot will attempt to connect to the IRC network and channels specified in
`config.json`.

## REPL
The IRC client created in `lib/bot/index.js` can be imported into the REPL and
manipulated there. For example:

    $ node
    > const bot = require('.').bot;
    > bot.say('#channel', 'Hello world!');
