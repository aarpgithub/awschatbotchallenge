import { LexService, ServerlessBotConfig } from "../../Lexstack";

import {
  ServerlessPatched,
  DeploymentStage
} from "../../ServerlessPlugins/JestServerlessConfig";

import { removeKeysRecursive } from "../../Helpers";

let serverlessConfig: ServerlessPatched | null = null;

describe("ONLINE:", () => {
  it("Should reflect the serverless config for each environment", async () => {
    const stages: Array<DeploymentStage> = ["dev"];
    const configs = stages.map(e => {
      return new ServerlessPatched(e);
    });

    for (const config of configs) {
      await config.init();
      await config.run();

      removeKeysRecursive(config, ["invocationId"]);
    }

    expect(configs).toMatchSnapshot();
  });
});
