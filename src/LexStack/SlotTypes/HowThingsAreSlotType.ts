import { SlotTypeDefinition, BotConfiguration } from "../LexService";

export class HowThingsAreSlotType extends SlotTypeDefinition {
  name = "HowThingsAreSlotType";
  description = "Opinionated set of possibilities for how things are";
  enumerationValues = [
    {
      value: "Great!"
    },
    {
      value: "Stellar!"
    },
    {
      value: "Positive!"
    }
  ];
  slotConstraint = "Required";
  slotType = "HowThingsAreSlotType";
  valueElicitationPrompt = {
    messages: [
      {
        contentType: "PlainText",
        content: "How is your day going?"
      }
    ],
    maxAttempts: 1
  };
  sampleUtterances = [
    "I'm doing {HowThingsAreSlotType}",
    "Things are going {HowThingsAreSlotType}",
    "It's been a {HowThingsAreSlotType} kind of day",
    "Pretty much {HowThingsAreSlotType}",
    "Not too {HowThingsAreSlotType}"
  ];
  responseCard = undefined;
}
