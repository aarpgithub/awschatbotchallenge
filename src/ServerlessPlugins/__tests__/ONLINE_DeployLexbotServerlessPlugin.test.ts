import { LexService, ServerlessBotConfig } from "../../LexStack";
import {
  ServerlessPatched,
  DeploymentStage
} from "../../ServerlessPlugins/JestServerlessConfig";

import { ExampleBot } from "../../LexStack/Bots";
import { removeKeysRecursive } from "../../Helpers";

let serverlessConfig: ServerlessPatched | null = null;

beforeAll(async () => {
  serverlessConfig = new ServerlessPatched("stage");
  await serverlessConfig.init();
  await serverlessConfig.run();
});

it("Expected BotConfig should be pulled correctly from the serverless config", () => {
  const botConfig = new ServerlessBotConfig(serverlessConfig, {}, true);
  const { stage, region, ownerId, profile, lexTestMode } = botConfig;
  expect({ stage, region, ownerId, profile, lexTestMode }).toMatchSnapshot();
});

describe("ONLINE:", () => {
  it("Deployed Bot definition should match expectations", async () => {
    const botConfig = new ServerlessBotConfig(serverlessConfig, {}, true);
    const lexService = new LexService(botConfig);
    const bot = new ExampleBot(botConfig);

    await lexService.updateFullBot(bot);
    const deployed: any = {};

    deployed.slotTypeDefinitions = [];
    for (const d of bot.slotTypeDefinitions) {
      deployed.slotTypeDefinitions.push(
        await lexService.getSlotType({
          name: d.name,
          version: "$LATEST"
        })
      );
    }

    deployed.intentDefinitions = [];

    for (const d of bot.intents) {
      deployed.intentDefinitions.push(
        await lexService.getIntent({
          name: d.name,
          version: "$LATEST"
        })
      );
    }

    deployed.botDefinition = await lexService.getBot({
      name: bot.name,
      versionOrAlias: "$LATEST"
    });

    // remove transient properties
    removeKeysRecursive(deployed, [
      "createdDate",
      "lastUpdatedDate",
      "checksum"
    ]);

    expect(deployed).toMatchSnapshot();
  });
});
