var config = {};

config.general = {};
config.general.port = 3000;
config.general.uiport = 8080;

config.db = {};
config.db.location = 'data/db/ehras.db';
config.db.test_location = ":memory:";

module.exports = config;
