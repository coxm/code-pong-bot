exports.up = async knex => {
  await knex.schema.renameTable('baton', 'status');
  await knex.schema.table('status', async table => {
    table.dropColumn('time');
  });
};


exports.down = async knex => {
  await knex.schema.renameTable('status', 'baton');
  await knex.schema.table('baton', async table => {
    table.datetime('time').nullable();
  });
};
