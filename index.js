'use strict';

module.exports = (app, lando) => {
  // Log that this plugin has loaded
  lando.events.on('post-bootstrap-config', () => {
    lando.log.info('Custom plugin loaded!');
  });

};