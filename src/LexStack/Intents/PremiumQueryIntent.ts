import { LexModelBuildingService as Lex } from "aws-sdk";

import {
  BotConfiguration,
  SlotTypeDefinition,
  IntentDefinition,
  DialogHook,
  FulfillmentHook
} from "../LexService";

import {
  IncomeLevelSlotType,
  StateNameSlotType,
  InsuranceSlotType
} from "../SlotTypes";

export class PremiumQueryIntent extends IntentDefinition {
  readonly _name = "PremiumQueryIntent";
  readonly description = "Answer questions about proposed Senate HealthCare Bill";
  readonly slotTypeVersion = "$LATEST";

  get slots() {
    return [
      new IncomeLevelSlotType(this.c, { priority: 1 }),
      new StateNameSlotType(this.c, { priority: 2 }),
      new InsuranceSlotType(this.c, { priority: 3 })
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
    // return DialogHook("debugIntentResolver", this.c);
  }

  get fulfillmentActivity() {
    return FulfillmentHook("HealthCareTool", this.c);
    // return FulfillmentHook("debugIntentResolver", this.c);
  }
}
