const logger = require('../util/logger');
const status = require('../util/nodeStatus');
const salesforceHelper = require('../util/salesforceHelper');

module.exports = function (RED) {
  'use strict';

  function SalesforceApexNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.salesforce = config.salesforce;
    node.path = config.path;
    node.operation = config.operation;
    node.salesforceConfig = RED.nodes.getNode(node.salesforce);

    if (node.salesforceConfig) {

      node.on('input', function (msg) {

        status.info(node, "processing");

        node.sendMsg = function (err, result) {
          if (err) {
            node.error(err.message, msg);
            status.error(node, err.message);
          } else {
            status.clear(node);
          }
          msg.payload = result;
          return node.send(msg);
        };

        node.salesforceConfig.login(msg, function (err, conn) {
          if (err) {
            return node.sendMsg(err);
          }
          switch (node.operation) {

            case 'get':
              //msg.payload = salesforceHelper.convType(msg.payload, 'object');
              conn.apex.get(msg.path, node.sendMsg);
              break;

            case 'post':
              //msg.payload = salesforceHelper.convType(msg.payload, 'object');
              conn.apex.post(msg.path, msg.payload, node.sendMsg);
              break;

            case 'put':
              //msg.payload = salesforceHelper.convType(msg.payload, 'object');
              conn.apex.put(msg.path, msg.payload, node.sendMsg);
              break;

            case 'patch':
              //msg.payload = salesforceHelper.convType(msg.payload, 'object');
              conn.apex.patch(msg.path, msg.payload, node.sendMsg);
              break;

            case 'delete':
              //msg.payload = salesforceHelper.convType(msg.payload, 'object');
              conn.apex.delete(msg.path, msg.payload, node.sendMsg);
              break;

          }
        });
      });

    } else {
      var err = new Error('missing force configuration');
      node.error(err.message, msg);
      status.error(node, err.message);
    }

  }

  RED.nodes.registerType('salesforce-apex', SalesforceApexNode);
}
