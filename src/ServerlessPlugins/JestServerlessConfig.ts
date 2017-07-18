import Serverless = require("serverless");
import CLI = require("serverless/lib/classes/CLI");
import { join } from "path";

export type DeploymentStage = "dev" | "stage" | "prod";

export class ServerlessPatched extends Serverless {
  private _deploymentTarget: DeploymentStage;

  constructor(stage: DeploymentStage) {
    super({
      servicePath: join(__dirname, "../../")
    });
    this._deploymentTarget = stage;
  }
  init(): Promise<any> {
    // create a new CLI instance
    this.cli = new CLI(this, ["-s", this._deploymentTarget]);

    // get an array of commands and options that should be processed
    this.processedInput = this.cli.processInput();

    // set the options and commands which were processed by the CLI
    this.pluginManager.setCliOptions(this.processedInput.options);
    this.pluginManager.setCliCommands(this.processedInput.commands);

    return this.service.load(this.processedInput.options).then(() => {
      // load all plugins
      // this.pluginManager.loadAllPlugins(this.service.plugins);

      // give the CLI the plugins and commands so that it can print out
      // information such as options when the user enters --help
      this.cli.setLoadedPlugins(this.pluginManager.getPlugins());
      this.cli.setLoadedCommands(this.pluginManager.getCommands());
      return this.pluginManager.updateAutocompleteCacheFile();
    });
  }

  run(): Promise<any> {
    // make sure the command exists before doing anything else
    this.pluginManager.validateCommand(this.processedInput.commands);

    // populate variables after --help, otherwise help may fail to print
    // (https://github.com/serverless/serverless/issues/2041)
    return this.variables
      .populateService(this.pluginManager.cliOptions)
      .then(() => {
        // populate function names after variables are loaded in case functions were externalized
        // (https://github.com/serverless/serverless/issues/2997)
        this.service.setFunctionNames(this.processedInput.options);

        // merge custom resources after variables have been populated
        // (https://github.com/serverless/serverless/issues/3511)
        this.service.mergeResourceArrays();

        // validate the service configuration, now that variables are loaded
        this.service.validate();
      });
  }
}
