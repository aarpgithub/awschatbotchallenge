import { SlotTypeDefinition, BotConfiguration } from "../LexService";

export class InsuranceSlotType extends SlotTypeDefinition {
  name = "InsuranceSlotType";
  description = "Available Insurance Types";
  enumerationValues = [
    {
      value: "private"
    },
    {
      value: "employer"
    }
  ];
  slotConstraint = "Required";
  slotType = "InsuranceSlotType";
  valueElicitationPrompt = {
    messages: [
      {
        contentType: "PlainText",
        content:
          "What type of insurance would you like to look at? Is it Private Insurance or Employer Insurance?"
      }
    ],
    maxAttempts: 2
  };
  sampleUtterances = [
    "How about {InsuranceSlotType}",
    "I want {InsuranceSlotType}"
  ];
  responseCard = undefined;
}
