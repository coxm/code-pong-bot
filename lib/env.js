/**
 * @file lib/env.js
 * Exposes configuration loaded from config.yaml to the rest of the app.
 */

const fs = require('fs');

const yaml = require('js-yaml');
const moment = require('moment');


const schema = yaml.Schema.create([
  new yaml.Type('!utc', {
    kind: 'scalar',
    resolve(data) {
      return typeof data === 'string';
    },
    construct(data) {
      const m = moment.utc(data);
      if (!m.isValid()) {
        throw new Error("Invalid UTC moment");
      }
      return m;
    },
  })
]);


let configFile = 'config.yaml';
if (!fs.existsSync(configFile)) {
  configFile = 'example.config.yaml';
}
const env = yaml.load(fs.readFileSync(configFile), {
  schema,
});
module.exports = env;
