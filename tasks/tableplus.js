"use strict";

const _ = require("lodash");
const clipboardy = require("clipboardy");
const filterServices = require("../src/filter-services").filterServices;
const dbServiceGet = require("../src/db-services").get;
const fs = require("fs");

module.exports = (lando) => ({
  command: "tableplus",
  describe: "Opens the database in the TablePlus GUI",
  level: "app",
  options: _.merge({}, lando.cli.formatOptions(), {
    service: {
      describe: "Specify the database service",
      alias: ["s"],
      default: "database",
    },
    dbuser: {
      describe: "Specify the database service user",
      alias: ["u"],
      default: ""
    },
    dbpassword: {
      describe: "Specify the database service password",
      alias: ["p"],
      default: ""
    },
    dbdatabase: {
      describe: "Specify the database service database",
      alias: ["d"],
      default: ""
    },


  }),
  run: (options) => {
    const app = lando.getApp(options._app.root);
    // Get services
    //app.opts = !_.isEmpty(options.service) ? { services: options.service } : {};

    return app.init().then(() => {
      const info = _.filter(app.info, (service) =>
        filterServices(service.service, options.service)
      );
      const dbservice = dbServiceGet(app, info);
      const random = Math.floor(Math.random() * 1000000);
      const filename = `/tmp/docksal-sequelpro-${random}.spf`;

      const external = dbservice.external_connection.port;
      const creds = dbservice.creds;
      const mysqlTypes = ["mariadb", "mysql", "postgre"];

      // console.log(options, creds, options.u, options.p);

      const dbuser = options.u || creds.user;
      const dbpassword = options.p || creds.password;
      const dbdatabase = options.d || creds.database;

      if (mysqlTypes.some((v) => dbservice.type.includes(v))) {
        let $com = "";

        switch (dbservice.type) {
          default:
            $com = `${dbservice.type}://`.replace("laravel-", "").replace("lamp-", "");
        }

        lando.shell.sh(
          [
            "open",
            `${$com}${dbuser}:${dbpassword}@127.0.0.1:${external}/${dbdatabase}?statusColor=007F3D&enviroment=local&name=${app._name}`,
          ],
          {
            mode: "exec",
            detached: true,
          }
        );

        return;
      } else {
        console.log(
          "Currently only MySQL, Postgre and MariaDB connections are supported"
        );
      }
    });
  },
});
