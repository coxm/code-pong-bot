#!/usr/bin/env node
const express = require('express');
const isValidDate = require('date-fns/is_valid');
const parseDate = require('date-fns/parse');

const env = exports.env = require('./lib/env');
const util = exports.util = require('./lib/util');
const bot = exports.bot = require('./lib/bot');
const db = exports.db = require('./lib/db');
const middleware = exports.middleware = require('./lib/api/middleware');


const api = express();
api.use(express.json({strict: true}));
api.use(middleware.logRequest);
api.use(middleware.handleErrors);


const ircReport = message => {
  for (const channel of env.irc.client.channels) {
    bot.say(channel, message);
  }
};


api.get('/baton', async (req, res) => {
  res.json(await db.status());
});


api.post('/baton/gimme', async (req, res) => {
  // Sanitise input.
  if (!req.body) {
    res.status(400).send('Empty request body');
    return;
  }
  if (!util.isValidUserName(req.body.user)) {
    console.log('Invalid username: "%s"', req.body.user);
    res.status(400).send('Invalid username');
    return;
  }
  console.log('Give baton to %s', req.body.user);

  let result = null;
  try {
    result = await db.gimme({ponger: req.body.user});
  }
  catch (err) {
    console.error('ERROR: gimme failed:', err && err.message);
    res.status(500).send('Gimme failed');
    return;
  }

  res.json(result);
  if (result.success) {
    ircReport(`${req.body.user} just grabbed the baton!`);
  }
});


/**
 * Format a commit message.
 *
 * @param {object} body the body parameters.
 * @param {string} body.user the user making the commit.
 * @param {string} body.message the commit message.
 * @param {string} body.url the url of the committed code.
 * @param {?(Array[string] | string)} append optional message to append.
 */
const formatCommitMessage = (body, append) => {
  if (typeof body !== 'object') {
    body = {};
  }
  const fragments = [
    typeof body.user === 'string' ? body.user : 'Someone',
    'made a change',
  ];
  if (typeof body.message === 'string') {
    fragments.push(`(${body.message})`);
  }
  if (typeof body.url === 'string') {
    fragments.push(`at ${body.url}`);
  }
  // Allows for string or array.
  return (append ? fragments.concat(append) : fragments).join(' ');
};


api.post('/baton/release', async (req, res) => {
  let changed = false;
  try {
    changed = await db.release();
  }
  catch (err) {
    console.error('ERROR: release failed:', err && err.message);
    res.status(500).send('Release failed');
    return;
  }

  ircReport(formatCommitMessage(req.body, 'and has finished ponging'));
  res.json({changed});
});


api.post('/notify/commit', async (req, res) => {
  ircReport(formatCommitMessage(req.body));
  res.sendStatus(204);
});


api.listen(env.api.port, () => {
  console.log('Listening on port', env.api.port);
});
