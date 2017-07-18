require("source-map-support").install();
var plugins = require("../lib/ServerlessPlugins/DeployDynamoDatabasePlugin");
module.exports = plugins.DeployDynamoDbPlugin;
