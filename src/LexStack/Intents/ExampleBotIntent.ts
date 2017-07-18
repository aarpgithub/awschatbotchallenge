import { LexModelBuildingService as Lex } from "aws-sdk";

import {
  BotConfiguration,
  IntentDefinition,
  DialogHook,
  FulfillmentHook
} from "../LexService";

import { ExampleBotSlotType, StateNameSlotType } from "../SlotTypes";

export class ExampleBotIntent extends IntentDefinition {
  readonly _name = "ExampleBotIntent";
  readonly description = "This is just a definition for testing";

  get slots() {
    return [
      new ExampleBotSlotType(this.c, { priority: 1 }),
      new StateNameSlotType(this.c, { priority: 2 })
    ];
  }

  readonly sampleUtterances = [
    "I would like to calculate premium increase",
    "What would be my premium",
    "What would be my health care premium"
  ];

  readonly confirmationPrompt = undefined;
  readonly rejectionStatement = undefined;
  readonly conclusionStatement = undefined;
  readonly followUpPrompt = undefined;

  get dialogCodeHook() {
    return DialogHook("HealthCareTool", this.c);
  }

  get fulfillmentActivity() {
    return FulfillmentHook("HealthCareTool", this.c);
  }
}
