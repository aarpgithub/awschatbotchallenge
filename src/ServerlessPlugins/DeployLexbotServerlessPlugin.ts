/**
 * Serverless Plugin for updating lex bot definitions
 */
import { LexModelBuildingService } from "aws-sdk";
import { LexService, BotConfiguration } from "../Lexstack/LexService";
import { ServerlessBotConfig } from "../Lexstack/BotConfig";
import { AllBots } from "../LexStack/Bots";
import { Validator, IsString } from "class-validator";

export class DeployLexbotPlugin {
  serverless: any;
  options: any;
  commands: any;
  hooks: any;

  constructor(serverless: any, options: any) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      "deploy-lexbot": {
        lifecycleEvents: ["updateBotDefinitions", "buildBot"],
        usage: "Updates amazon lex bot definition",
        options: {
          stage: {
            usage: "Specify deployment stage for lexbot (dev, staging, prod)",
            required: true,
            shortcut: "s"
          }
          // "bot-name": {
          //   usage: "Name of bot to update (all if unspecified)",
          //   required: false,
          //   shortcut: "b"
          // }
        }
      }
    };

    this.hooks = {
      "deploy-lexbot:updateBotDefinitions": this.updateBotDefinitions.bind(this)
    };
  }

  async updateBotDefinitions() {
    const botConfig = new ServerlessBotConfig(this.serverless, this.options);
    const lexService = new LexService(botConfig);

    const bots = AllBots(botConfig);

    // upload regular bots
    await lexService.updateBotWitLoaders(bots);
    botConfig.lexTestMode = true;

    // upload testing versions of bots
    // these are not connected to Lambda handlers
    // await lexService.updateBotWitLoaders(bots);
  }
}
