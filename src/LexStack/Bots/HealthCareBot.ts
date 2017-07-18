import {
  SlotTypeDefinition,
  IntentDefinition,
  BotDefinition
} from "../LexService";
import { InsuranceSlotType } from "../SlotTypes";
import { PremiumQueryIntent, HowAreYouIntent } from "../Intents";

export class HealthCareBot extends BotDefinition {
  _name = "HealthCareBot";

  description = "Answers questions about GOP health care bill";

  get intents(): Array<IntentDefinition> {
    return [new PremiumQueryIntent(this.c), new HowAreYouIntent(this.c)];
  }

  clarificationPrompt = {
    messages: [
      {
        contentType: "PlainText",
        content:
          "I'm sorry I didn't understand that. Can you please ask it in a different way?"
      }
    ],
    maxAttempts: 2
  };

  abortStatement = {
    messages: [
      {
        contentType: "PlainText",
        content: "Sorry, I could not understand. Goodbye."
      }
    ]
  };

  idleSessionTTLInSeconds = 120;
  voiceId = "Salli";

  get aliases(): Array<string> {
    return ["slackSenateChannelProductionAlias"];
  }
}
