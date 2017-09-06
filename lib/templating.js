/**
 * @file lib/templating.js
 *
 * Templating utilities.
 */

const path = require('path');

const nunjucks = require('nunjucks');
const moment = require('moment');


const nj = nunjucks.configure(path.resolve(__dirname, '../templates'));


const timespanSteps = [
  { seconds: 604800, singular: 'week', plural: 'weeks' },
  { seconds: 86400, singular: 'day', plural: 'days' },
  { seconds: 3600, singular: 'hour', plural: 'hours' },
  { seconds: 60, singular: 'minute', plural: 'minutes' },
  { seconds: 1, singular: 'second', plural: 'seconds' }
];


const toCommaSeparatedList = (items) => {
  if (items.length < 2) {
    return items[0];
  }
  const last = items.length - 1;
  return `${items.slice(0, last).join(', ')} and ${items[last]}`;
};


/**
 * Timespan filter.
 *
 * @param {string|Date|Moment} end the end of the timespan.
 * @param {string|Date|Moment} [begin] the beginning of the timespan.
 *
 * If `begin` is not provided, the current time is used.
 */
nj.addFilter('timespan', (end, begin = undefined) => {
  end = moment.utc(end);
  begin = moment.utc(begin);
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
});


module.exports = nj;
