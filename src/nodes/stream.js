const logger = require('../util/logger');
const status = require('../util/nodeStatus');
const salesforceHelper = require('../util/salesforceHelper');

module.exports = function (RED) {
    'use strict';

    function SalesforceStreamNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.salesforce = config.salesforce;
        node.topic = config.topic;
        node.salesforceConfig = RED.nodes.getNode(node.salesforce);

        if (node.salesforceConfig) {

            status.warningRing(node, 'connecting');

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

                status.infoRing(node, "connected");
                conn.streaming.topic(node.topic).subscribe(function (message) {
                    status.success(node, "message");
                    node.sendMsg(null, {
                        payload: {
                            eventType: message.event.type,
                            eventCreatedDate: message.event.createdDate,
                            objectId: message.sobject.Id,
                        }
                    })
                });

            });

        } else {
            var err = new Error('missing force configuration');
            node.error(err.message, msg);
            status.error(node, err.message);
        }

    }

    RED.nodes.registerType('salesforce-stream', SalesforceStreamNode);
}
