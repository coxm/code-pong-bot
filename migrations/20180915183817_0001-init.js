exports.up = async (knex) => {
  await knex.schema.hasTable('baton').then(async (exists) => {
    if (!exists) {
      await knex.schema.createTable('baton', table => {
        table.increments('id').primary();
        table.string('user', 64).nullable();
        table.datetime('time').nullable();
      });
    }
  });

  await knex('baton').insert({
    user: null,
    time: null,
  });
};


exports.down = knex => knex.schema.dropTableIfExists('baton');
