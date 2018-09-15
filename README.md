# Code Pong Bot
An IRC bot and HTTP server for code pong. Forked from
[alakajam-irc](https://github.com/alakajam-team/alakajam-irc).

## Supported commands
See the [specification document](./spec/README.md).

## Quick start
Create a configuration file, `config.json`, analogous to `example.config.json`
(`config.json` is _not_ tracked by Git).

The bot and server can then be started by running:

    npm install
    npm start

The bot will attempt to connect to the IRC network and channels specified in
`config.json`.

## REPL
The client created in `index.js` can be imported into the REPL and manipulated there. For example:

    $ node
    > const client = require('.');
    > client.say('#channel', 'Hello world!');
