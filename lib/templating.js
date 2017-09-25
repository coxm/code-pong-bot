/**
 * @file lib/templating.js
 *
 * Templating utilities.
 */

const path = require('path');

const nunjucks = require('nunjucks');

const util = require('./util');


const nj = nunjucks.configure(path.resolve(__dirname, '../templates'));


/**
 * Timespan filter.
 *
 * @param {string|Date|Moment} end the end of the timespan.
 * @param {string|Date|Moment} [begin] the beginning of the timespan.
 *
 * If `begin` is not provided, the current time is used.
 */
nj.addFilter('timespan', util.timespanToString);


module.exports = nj;
