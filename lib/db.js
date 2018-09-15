const knex = require('knex')(require('./env').db);
module.exports.knex = knex;


/**
 * @type BatonHolder
 * @prop {string} user the user to assign the baton to.
 * @prop {string} time the time of grabbing, as an ISO8601 string.
 */

/**
 * @type BatonSuccess
 * @extends BatonHolder
 * @prop {boolean} success whether the operation was successful.
 */


/**
 * Get the current baton holder.
 *
 * @returns {Promise<BatonHolder>}
 */
const baton = () => knex.first(['user', 'time']).from('baton');
module.exports.baton = baton;


/**
 * Attempt to grab the baton.
 *
 * @param {BatonHolder} row the details to insert.
 * @returns {BatonSuccess} the baton holder after attempting a grab.
 */
const gimme = async (row) => {
  const results = await knex('baton')
    .where({
      id: 1,
      user: null,
    })
    .update(row)
    .returning(['user', 'time']);

  return {success: results.length > 0};
};
module.exports.gimme = gimme;


/**
 * Release the baton.
 */
const release = () => knex('baton')
  .where('id', 1)
  .update({
    user: null,
    time: null,
  });
module.exports.release = release;
