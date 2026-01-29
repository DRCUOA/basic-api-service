'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tasks', [
      {
        title: 'Set up database schema',
        description: 'Initialize PostgreSQL database and apply migrations',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Wire Sequelize config',
        description: 'Ensure CLI and runtime configs are aligned',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Verify API boot',
        description: 'Confirm API verifies schema and starts cleanly',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tasks', {
      title: [
        'Set up database schema',
        'Wire Sequelize config',
        'Verify API boot'
      ]
    });
  }
};

