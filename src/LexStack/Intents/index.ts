export * from "./ExampleBotIntent";
export * from "./PremiumQueryIntent";
export * from "./HowAreYouIntent";

import { BotConfiguration } from "../LexService";
import {
  ExampleBotIntent,
  PremiumQueryIntent,
  HowAreYouIntent
} from "../Intents";

export type KnownIntentName =
  | "ExampleBotIntent"
  | "PremiumQueryIntent"
  | "HowAreYouIntent";
