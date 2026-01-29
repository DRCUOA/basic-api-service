export async function up(queryInterface, Sequelize) {
  // Enable uuid extension if not already enabled
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // Drop the primary key constraint first
  await queryInterface.removeConstraint('tasks', 'tasks_pkey');

  // Drop the existing id column
  await queryInterface.removeColumn('tasks', 'id');

  // Add new UUID id column with default uuid_generate_v4()
  await queryInterface.addColumn('tasks', 'id', {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false
  });
}

export async function down(queryInterface, Sequelize) {
  // Drop the primary key constraint first
  await queryInterface.removeConstraint('tasks', 'tasks_pkey');

  // Drop the UUID id column
  await queryInterface.removeColumn('tasks', 'id');

  // Restore the original INTEGER id column
  await queryInterface.addColumn('tasks', 'id', {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  });
}
