# alakajam-irc
An IRC bot for [alakajam.com](alakajam.com).

## Supported commands
See the [commands documentation](https://github.com/alakajam-team/alakajam-irc/blob/master/docs/commands.md).

## Quick start
The bot can be started by running:

    npm install
    npm start

This will connect using the default configuration in [example.config.yaml](https://github.com/alakajam-team/alakajam-irc/blob/master/example.config.yaml). To use custom configuration (recommended), create an alternative config file called `config.yaml`. This file takes precedence over `example.config.yaml` and is not tracked by git.

## REPL
The client created in `index.js` can be imported into the REPL and manipulated there. For example:

    $ node
    > const client = require('.');
    > client.say('#alakajam', 'Abracadabra');

## Configuration
Configuration options are explained in [example.config.yaml](https://github.com/alakajam-team/alakajam-irc/blob/master/example.config.yaml).
