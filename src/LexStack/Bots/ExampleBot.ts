import {
  SlotTypeDefinition,
  IntentDefinition,
  BotDefinition
} from "../LexService";
import { ExampleBotSlotType } from "../SlotTypes";
import { ExampleBotIntent } from "../Intents";

export class ExampleBot extends BotDefinition {
  _name = "ExampleBot";

  description = "A bot used for testing purposes";

  get intents() {
    return [new ExampleBotIntent(this.c)];
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
    return [];
  }
}
