import { LexModelBuildingService as Lex } from "aws-sdk";
import {
  BotConfiguration,
  IntentDefinition,
  DialogHook,
  FulfillmentHook
} from "../LexService";

import { HowThingsAreSlotType } from "../SlotTypes";

export class HowAreYouIntent extends IntentDefinition {
  readonly _name = "HowAreYouIntent";
  readonly description = "Is interested in how things are going";

  get slots() {
    return [new HowThingsAreSlotType(this.c, { priority: 1 })];
  }

  readonly sampleUtterances = [
    "Hi lex how are you",
    "Hello lex",
    "How's it going",
    "What's up",
    "How's your day"
  ];

  readonly confirmationPrompt = undefined;
  readonly rejectionStatement = undefined;
  readonly conclusionStatement = undefined;
  // get conclusionStatement() {
  //   return {
  //     messages: [
  //       {
  //         contentType: "PlainText",
  //         content:
  //           "Thanks for letting me know.  If you'd like I can answer questions about the proposed Senate GOP Health Care Bill.  Try asking me what your premium will be."
  //       },
  //       {
  //         contentType: "PlainText",
  //         content:
  //           "Tell me again if things change.  I can also help you figure out your health insurance premium."
  //       }
  //     ]
  //   };
  // }
  readonly followUpPrompt = undefined;
  dialogCodeHook = DialogHook("HealthCareTool", this.c);
  fulfillmentActivity = FulfillmentHook("HealthCareTool", this.c);
}
