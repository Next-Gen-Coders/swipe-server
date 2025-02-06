require("dotenv").config();

const { version } = require("../../package.json");

const Config = {
  VERSION: version,
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
};

export default Config;
