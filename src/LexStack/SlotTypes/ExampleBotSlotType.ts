import { BuiltinSlotTypeDefinition, BotConfiguration } from "../LexService";

import { SessionAttributes } from "../LexMessages";

export class ExampleBotSlotType extends BuiltinSlotTypeDefinition {
  name = "ExampleBotSlotType";

  description = "Choose 10 or 100";

  enumerationValues = [
    {
      value: "10"
    },
    {
      value: "100"
    }
  ];

  slotConstraint = "Required";
  slotType = "AMAZON.NUMBER";
  valueElicitationPrompt = {
    messages: [
      {
        contentType: "PlainText",
        content: "Do you want 10 or 100?"
      }
    ],
    maxAttempts: 2
  };
  sampleUtterances = [
    "I'll take {ExampleBotSlotType}",
    "My favorite number is {ExampleBotSlotType}"
  ];

  responseCard = undefined;
}
