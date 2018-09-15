const cli = require('../util').cli;


/** Event listener managing object. */
class HandlerManager {
  constructor() {
    this.lists = {};
  }

  add(client, eventName, listener, context, desc) {
    function wrapper() {
      try {
        listener.call(context, this, ...arguments);  // `this` is the client.
      }
      catch (err) {
        console.error(
          cli.err('ERR'), `${desc}::${cli.info(eventName)}:`, err.message,
          '\n', err.stack
        );
      }
    }
    (this.lists[eventName] || (this.lists[eventName] = [])).push(wrapper);
    client.on(eventName, wrapper);
  }

  addMany(client, listeners) {
    for (const eventName in listeners) {
      this.add(client, eventName, listeners[eventName]);
    }
  }

  remove(client, eventName, listener) {
    const list = this.lists[eventName];
    if (!list) {
      return;
    }
    const index = list.indexOf(listener);
    if (index >= 0) {
      client.removeListener(eventName, listener);
      list.splice(index, 1);
    }
  }

  removeAll(client) {
    for (const eventName in this.lists) {
      for (const listener of this.lists[eventName]) {
        client.removeListener(eventName, listener);
      } 
    }
    this.lists = {};
  }
}
module.exports.HandlerManager = HandlerManager;
