require('dotenv').config();

module.exports = {
  development: {
    username: 'Rich',
    password: null,
    database: 'basic_api',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: 'Rich',
    password: null,
    database: 'basic_api_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  }
};

