const knex = require('knex')(require('./env').db);
module.exports.knex = knex;


/**
 * @type PongStatus
 * @prop {string} user the user who will start ponging.
 */

/**
 * @type GrabSuccess
 * @extends PongStatus
 * @prop {boolean} success whether the operation was successful.
 */


/**
 * Get the current status.
 *
 * @returns {Promise<PongStatus>}
 */
const status = () => knex.first(['user']).from('status');
module.exports.status = status;


/**
 * Attempt to start ponging.
 *
 * @param {PongStatus} row the details to insert.
 * @returns {GrabSuccess} the current status after attempting the grab.
 */
const gimme = async row => {
  const results = await knex('status')
    .where({
      id: 1,
      user: null,
    })
    .update(row)
    .returning(['user']);

  return {success: results.length > 0};
};
module.exports.gimme = gimme;


/**
 * Release the baton.
 */
const release = () => knex('status').where('id', 1).update({user: null});
module.exports.release = release;
