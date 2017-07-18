import { BuiltinSlotTypeDefinition, BotConfiguration } from "../LexService";

export class IncomeLevelSlotType extends BuiltinSlotTypeDefinition {
  name = "IncomeLevel";
  description: "Represent an income level";
  enumerationValues = undefined;
  slotConstraint = "Required";
  slotType = "AMAZON.NUMBER";
  valueElicitationPrompt = {
    messages: [
      {
        contentType: "PlainText",
        content: "What is your Income level in dollars?"
      }
    ],
    maxAttempts: 2
  };
  sampleUtterances = [
    "My income level is {IncomeLevel}",
    "I make {IncomeLevel} dollars per year"
  ];
  responseCard = undefined;
}
