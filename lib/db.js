const knex = require('knex')(require('./env').db);
module.exports.knex = knex;


/**
 * @type PongStatus
 * @prop {string} ponger the ponger who is/will start ponging.
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
const status = () => knex.first(['ponger']).from('status');
module.exports.status = status;


/**
 * Attempt to start ponging.
 *
 * @param {PongStatus} row the details to insert.
 * @returns {GrabSuccess} the current status after attempting the grab.
 */
const gimme = async row => {
  if (typeof row.ponger !== 'string') {
    throw new Error('Invalid ponger');
  }
  const results = await knex('status')
    .where({
      id: 1,
      ponger: null,
    })
    .update(row)
    .returning(['ponger']);

  return {success: results.length > 0};
};
module.exports.gimme = gimme;


const releaseInnerQuery = queryBuilder => queryBuilder
  .update('ponger', null)
  .from('status')
  .whereNotNull('ponger')
  .andWhere('id', 1)
  .returning(1);


/**
 * Release the baton.
 *
 * @returns {boolean} true if the baton was newly released; false otherwise.
 */
const release = async () => {
  // Should be of the form [{count: str}] where str is '0' or '1'.
  const result = await knex
    .with('rows', releaseInnerQuery)
    .from('rows')
    .count();
  return result[0].count === '1';
};
module.exports.release = release;
