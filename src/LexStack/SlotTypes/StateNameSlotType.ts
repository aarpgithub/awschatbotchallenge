import { BuiltinSlotTypeDefinition, BotConfiguration } from "../LexService";

export class StateNameSlotType extends BuiltinSlotTypeDefinition {
  name = "StateNameSlotType";
  description = "Represents a US State";
  enumerationValues = undefined;
  slotConstraint = "Required";
  slotType = "AMAZON.US_STATE";
  valueElicitationPrompt = {
    messages: [
      {
        contentType: "PlainText",
        content: "Provide your state"
      }
    ],
    maxAttempts: 2
  };
  sampleUtterances = [
    "I live in {StateNameSlotType}",
    "I come from {StateNameSlotType}"
  ];
  responseCard = undefined;
}
