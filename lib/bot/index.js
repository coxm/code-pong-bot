#!/usr/bin/env node
const irc = require('irc');

const {server, nick, client: options} = require('../env').irc;
const reload = require('./reload').reload;


const client = new irc.Client(server, nick, options);
module.exports = client;


module.exports.reload = () => reload(client);


reload(client);
