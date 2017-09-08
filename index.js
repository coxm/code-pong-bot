#!/usr/bin/env node
const irc = require('irc');

const {server, nick, client: options} = require('./lib/env');
const reload = require('./lib/reload').reload;


const client = new irc.Client(server, nick, options);
module.exports = client;


reload(client);
