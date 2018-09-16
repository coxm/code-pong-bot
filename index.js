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
  res.json(await db.baton());
});


api.post('/baton/gimme', async (req, res) => {
  // Sanitise input.
  if (!req.body) {
    res.status(400).send('Empty request body');
    return;
  }
  console.log('Gimme: user=%s, time=%s', req.body.user, req.body.time);
  if (!util.isValidUserName(req.body.user)) {
    res.status(400).send('Invalid username');
    return;
  }
  const datetime = parseDate(req.body.time);
  if (!isValidDate(datetime)) {
    res.status(400).send('Date/time must be in ISO8601 format');
    return;
  }

  let result = null;
  try {
    result = await db.gimme({
      user: req.body.user,
      time: datetime.toISOString(),
    });
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


api.post('/baton/release', async (req, res) => {
  try {
    await db.release();
  }
  catch (err) {
    console.error('ERROR: release failed:', err && err.message);
    res.status(500).send('Release failed');
    return;
  }

  res.sendStatus(204);
  ircReport('The baton has been released!');
});


api.listen(env.api.port, () => {
  console.log('Listening on port', env.api.port);
});
