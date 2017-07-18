export * from "./ExampleBot";
export * from "./HealthCareBot";

import { BotConfiguration, BotDefinition } from "../LexService";
import { ExampleBot, HealthCareBot } from "../Bots";

// silly interface for removing some type information ...
interface BotMapContainer {
  [k: string]: BotDefinition;
}

export const BotMap = (c: BotConfiguration) => {
  return {
    ExampleBot: new ExampleBot(c),
    HealthCareBot: new HealthCareBot(c)
  } as BotMapContainer;
};

export const AllBots = (c: BotConfiguration) => {
  const bots = Object.values(BotMap(c));
  if (bots == null) {
    throw Error("Error force unwrapping optional");
  }
  return bots;
};
