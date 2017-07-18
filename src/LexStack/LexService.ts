/**
Contains functions used to create or update an amazon lex bot definition including:

- Slot Types
- Intents and Sample Utterance
- Bot Definition

example usage:

    const botConfig = new ServerlessBotConfig(this.serverless, this.options);
    const lexService = new LexService(botConfig);
    const bots = AllBots(botConfig);

    await lexService.updateBotWitLoaders(bots);
*/

import {
  LexModelBuildingService as Lex,
  Lambda,
  Config as AWSConfig,
  SharedIniFileCredentials
} from "aws-sdk";

import { excludeNil, sha256checksum, snooze, union, flatten } from "../Helpers";

import {
  LambdaEventInput,
  LambdaEventResponse,
  SessionAttributes,
  createElicitSlotAction,
  createPlainTextMessage
} from "./LexMessages";

type LexGetResourceRequest =
  | Lex.GetBotRequest
  | Lex.GetIntentRequest
  | Lex.GetSlotTypeRequest;

type LexPutResourceRequest =
  | Lex.PutBotRequest
  | Lex.PutIntentRequest
  | Lex.PutSlotTypeRequest;

type LexPutResourceResponse =
  | Lex.PutBotResponse
  | Lex.PutIntentResponse
  | Lex.PutSlotTypeResponse;

type LexBotDefinitionRequest = {
  slotTypeDefinitions: Array<Lex.PutSlotTypeRequest>;
  intentDefinitions: Array<Lex.PutIntentRequest>;
  botDefinition: Lex.PutBotRequest;
  aliases: Array<Lex.PutBotAliasRequest>;
};

export interface BotConfiguration {
  profile: string;
  ownerId: string;
  region: string;
  lexTestMode: boolean;
}

export interface SlotTypeSettings {
  priority: Lex.Priority;
  slotConstraint?: Lex.SlotConstraint;
}

export abstract class SlotTypeDefinition {
  protected readonly c: BotConfiguration;
  constructor(c: BotConfiguration, params: SlotTypeSettings) {
    this.c = c;
    this.priority = params.priority;
    if (params.slotConstraint != null) {
      this.slotConstraint = params.slotConstraint;
    } else {
      this.slotConstraint = "Optional";
    }
  }

  abstract name: Lex.SlotTypeName;
  abstract description?: Lex.Description;
  abstract enumerationValues?: Lex.EnumerationValues;
  abstract slotConstraint: Lex.SlotConstraint;
  abstract slotType?: Lex.CustomOrBuiltinSlotTypeName;
  slotTypeVersion?: Lex.Version = "$LATEST";
  abstract valueElicitationPrompt?: Lex.Prompt;
  priority?: Lex.Priority;
  abstract sampleUtterances?: Lex.SlotUtteranceList;
  abstract responseCard?: Lex.ResponseCard;

  toPutSlotTypeRequest(): Lex.PutSlotTypeRequest {
    return excludeNil({
      name: this.name,
      description: this.description,
      enumerationValues: this.enumerationValues
    });
  }

  toSlotReference(): Lex.Slot {
    return excludeNil({
      name: this.name,
      description: this.description,
      slotConstraint: this.slotConstraint,
      slotType: this.slotType,
      slotTypeVersion: this.slotTypeVersion,
      valueElicitationPrompt: this.valueElicitationPrompt,
      priority: this.priority,
      sampleUtterances: this.sampleUtterances,
      responseCard: this.responseCard
    });
  }
}

export abstract class BuiltinSlotTypeDefinition extends SlotTypeDefinition {
  slotTypeVersion = undefined;
}

export abstract class IntentDefinition {
  protected readonly c: BotConfiguration;
  constructor(c: BotConfiguration) {
    this.c = c;
  }

  get name(): Lex.IntentName {
    if (this.c.lexTestMode) {
      return "testmode_" + this._name;
    }
    return this._name;
  }

  abstract _name: Lex.IntentName;
  abstract description?: Lex.Description;
  intentVersion: Lex.Version = "$LATEST";
  abstract slots?: Array<SlotTypeDefinition>;
  abstract sampleUtterances?: Lex.IntentUtteranceList;
  abstract confirmationPrompt?: Lex.Prompt;
  abstract rejectionStatement?: Lex.Statement;
  abstract followUpPrompt?: Lex.FollowUpPrompt;
  abstract conclusionStatement?: Lex.Statement;
  abstract dialogCodeHook?: Lex.CodeHook;
  abstract fulfillmentActivity?: Lex.FulfillmentActivity;

  toPutIntentRequest(): Lex.PutIntentRequest {
    const slotReferences = this.slots
      ? this.slots.map(e => {
          return e.toSlotReference();
        })
      : undefined;

    const response = excludeNil({
      name: this.name,
      description: this.description,
      slots: slotReferences,
      sampleUtterances: this.sampleUtterances,
      confirmationPrompt: this.confirmationPrompt,
      rejectionStatement: this.rejectionStatement,
      followUpPrompt: this.followUpPrompt,
      conclusionStatement: this.conclusionStatement,
      dialogCodeHook: this.dialogCodeHook,
      fulfillmentActivity: this.fulfillmentActivity
    });

    if (this.c.lexTestMode) {
      // TODO: change dialog code hook and fulfillment code hook to point to a generic debug lambda
    }

    return response;
  }

  toIntentReference() {
    return {
      intentName: this.name,
      intentVersion: this.intentVersion
    };
  }
}

export abstract class BotDefinition {
  c: BotConfiguration;
  constructor(c: BotConfiguration) {
    this.c = c;
  }

  get name(): Lex.IntentName {
    if (this.c.lexTestMode) {
      return "testmode_" + this._name;
    }
    return this._name;
  }
  abstract _name: Lex.IntentName;
  abstract description?: Lex.Description;
  abstract intents: Array<IntentDefinition>;
  abstract clarificationPrompt?: Lex.Prompt;
  abstract abortStatement?: Lex.Statement;
  abstract idleSessionTTLInSeconds?: Lex.SessionTTL;
  voiceId?: Lex.String = "Salli";
  locale: Lex.Locale = "en-US";
  processBehavior?: Lex.ProcessBehavior = "BUILD";
  childDirected = false;

  toPutBotRequest(): Lex.PutBotRequest {
    const intentReferences: Lex.IntentList = this.intents.map(intent => {
      return intent.toIntentReference();
    });

    return excludeNil({
      name: this.name,
      description: this.description,
      intents: intentReferences,
      clarificationPrompt: this.clarificationPrompt,
      abortStatement: this.abortStatement,
      idleSessionTTLInSeconds: this.idleSessionTTLInSeconds,
      voiceId: this.voiceId,
      locale: this.locale,
      processBehavior: this.processBehavior,
      childDirected: this.childDirected
    });
  }

  get slotTypeDefinitions(): Array<SlotTypeDefinition> {
    return union(
      flatten(
        this.intents.map(e => {
          if (e.slots == null) return [];
          return e.slots.map(i => {
            return i;
          });
        })
      )
    );
  }

  abstract readonly aliases: Array<string>;

  toLexBotAliasDefinitionRequest(): Array<Lex.PutBotAliasRequest> {
    // no aliases when in test mode
    if (this.c.lexTestMode) return [];
    const botName = this.name;
    const botVersion = "$LATEST";

    const botAliases: Array<Lex.PutBotAliasRequest> = [];

    for (const alias of this.aliases) {
      botAliases.push({
        botName: botName,
        botVersion: botVersion,
        name: alias
      });
    }

    return botAliases;
  }

  toLexBotDefinitionRequest(): LexBotDefinitionRequest {
    return {
      slotTypeDefinitions: union(
        this.slotTypeDefinitions.map(d => {
          return d.toPutSlotTypeRequest();
        })
      ),
      intentDefinitions: union(
        this.intents.map(d => {
          return d.toPutIntentRequest();
        })
      ),
      botDefinition: this.toPutBotRequest(),
      aliases: this.toLexBotAliasDefinitionRequest()
    };
  }
}

export const DialogHook = (
  lambdaName: string,
  c: BotConfiguration
): Lex.CodeHook => {
  return {
    uri: `arn:aws:lambda:${c.region}:${c.ownerId}:function:${lambdaName}`,
    messageVersion: "1.0"
  };
};

export const FulfillmentHook = (
  lambdaName: string | "ReturnIntent",
  c: BotConfiguration
): Lex.FulfillmentActivity | undefined => {
  if (lambdaName == "ReturnIntent") {
    return undefined;
  }
  return {
    type: "CodeHook",
    codeHook: {
      uri: `arn:aws:lambda:${c.region}:${c.ownerId}:function:${lambdaName}`,
      messageVersion: "1.0"
    }
  };
};

export class LexService {
  protected readonly c: BotConfiguration;
  private readonly awsConfig: AWSConfig;
  private readonly lexApi: Lex;
  private readonly lambdaApi: Lambda;
  constructor(c: BotConfiguration) {
    this.c = c;
    this.awsConfig = new AWSConfig({
      credentials: new SharedIniFileCredentials({ profile: c.profile }),
      region: c.region
    });
    this.lexApi = new Lex(this.awsConfig);
    this.lambdaApi = new Lambda(this.awsConfig);
  }

  /**
  Create or update an AWS Lex Resource definition

  AWS Lex Resources implement an MVCC like update management scheme.  To update a defined resource, the client must 'prove'
  that it knows the most recent definition of that resource by providing the 'checksum' of the target resource.

  This function first queries aws to see if the resource is already defined (using provided lexGetChecksumApi)
    - if the resource is defined it will update it with the necessary checksum using the provided lexUpdateResourceApi
    - if not, then it will create the resource using the provided lexUpdateResourceApi
  */
  private updateLexResource = async (
    lexGetChecksumApi: () => Promise<string>,
    lexUpdateResourceApi: (
      request: LexPutResourceRequest
    ) => Promise<LexPutResourceResponse>,
    resourceDefinition: LexPutResourceRequest
  ): Promise<LexPutResourceResponse> => {
    try {
      const checksum = await lexGetChecksumApi();
      // the slot is already defined -- we are updating and need to supply checksum
      resourceDefinition.checksum = checksum;
    } catch (err) {
      if (err.code == "LimitExceededException") {
        console.log("Failed due to api rate limiting, will retry in 2000ms");
        await snooze(2000);
        return await this.updateLexResource(
          lexGetChecksumApi,
          lexUpdateResourceApi,
          resourceDefinition
        );
      } else if (err.code == "NotFoundException") {
        // the slot is not yet defined -- we are creating one
        console.log(
          `Resource ${resourceDefinition.name} not yet defined: will create`
        );
      } else {
        throw err;
      }
    }

    try {
      const updateResponse = await lexUpdateResourceApi(resourceDefinition);
      if (updateResponse.checksum !== resourceDefinition.checksum) {
        console.log(
          `Updated resource: ${updateResponse.name} checksum: ${updateResponse.checksum}`
        );
      } else {
        console.log(`No change to resource: ${updateResponse.name}`);
      }
      return updateResponse;
    } catch (err) {
      if (err.code == "LimitExceededException") {
        console.log("Failed due to update Limit, will retry in 2000ms");
        await snooze(2000);
        return await this.updateLexResource(
          lexGetChecksumApi,
          lexUpdateResourceApi,
          resourceDefinition
        );
      } else {
        console.log("Error occurred while updating Lex Resource: ");
        throw err;
      }
    }
  };

  getSlotType = async (param: Lex.GetSlotTypeRequest) => {
    const response = await this.lexApi.getSlotType(param).promise();
    return response;
  };

  getSlotChecksum = async (param: Lex.GetSlotTypeRequest) => {
    const response = await this.getSlotType(param);
    return response.checksum as string;
  };

  getIntent = async (param: Lex.GetIntentRequest) => {
    const response = await this.lexApi.getIntent(param).promise();
    return response;
  };

  getIntentChecksum = async (param: Lex.GetIntentRequest) => {
    const response = await this.getIntent(param);
    return response.checksum as string;
  };

  getBot = async (param: Lex.GetBotRequest) => {
    const response = await this.lexApi.getBot(param).promise();
    return response;
  };

  getBotChecksum = async (param: Lex.GetBotRequest) => {
    const response = await this.getBot(param);
    return response.checksum as string;
  };

  getBotAlias = async (param: Lex.GetBotAliasRequest) => {
    const response = await this.lexApi.getBotAlias(param).promise();
    return response;
  };

  getBotAliasChecksum = async (param: Lex.GetBotAliasRequest) => {
    const response = await this.getBotAlias(param);
    return response.checksum as string;
  };

  private getBotStatus = async (
    param: Lex.GetBotVersionsRequest
  ): Promise<Lex.BotMetadata> => {
    const response = await this.lexApi.getBotVersions(param).promise();

    if (response.bots && response.bots.length > 0) {
      const latestBot = response.bots.filter(e => {
        return e.version == "$LATEST";
      })[0];
      if (latestBot.status == "BUILDING") {
        // still building, wait a bit then try again
        await snooze(1000);
        return await this.getBotStatus(param);
      } else {
        return latestBot;
      }
    }
    throw Error("This State should not be possible");
  };

  private putSlotType = async (slot: Lex.PutSlotTypeRequest) => {
    return this.lexApi.putSlotType(slot).promise();
  };

  private putIntent = async (slot: Lex.PutIntentRequest) => {
    return this.lexApi.putIntent(slot).promise();
  };

  private putBot = async (slot: Lex.PutBotRequest) => {
    return this.lexApi.putBot(slot).promise();
  };

  private putBotAlias = async (slot: Lex.PutBotAliasRequest) => {
    return this.lexApi.putBotAlias(slot).promise();
  };

  private ensureIntentHasInvokePermission = async (
    intentName: string,
    lambdaName: string
  ) => {
    let params = {
      Action: "lambda:InvokeFunction",
      Principal: "lex.amazonaws.com",
      FunctionName: lambdaName,
      SourceArn: `arn:aws:lex:${this.c.region}:${this.c
        .ownerId}:intent:${intentName}:*`,
      StatementId: ""
    };

    params.StatementId = sha256checksum(params);

    try {
      await this.lambdaApi.addPermission(params).promise();
      console.log(
        `Lambda:Invoke permission added: ${params.Principal}, SourceArn: ${params.SourceArn}`
      );
    } catch (err) {
      if (err.code == "ResourceConflictException") {
        // permission already granted
      } else {
        console.log("Error occurred adding Lambda:Invoke permission");
        throw err;
      }
    }
  };

  /**
  * Update amazon lex slottype definition
  *
  * Uses:
  *  - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lex.html#getSlotType-property
  *  - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lex.html#putSlotType-property
  *
  * @param lexApi
  * @param slotDefinition
  * @param version
  */
  private updateSlotType(
    slotDefinition: Lex.PutSlotTypeRequest,
    version: string = "$LATEST"
  ) {
    return this.updateLexResource(
      async () => {
        return this.getSlotChecksum({
          name: slotDefinition.name,
          version: version
        });
      },
      this.putSlotType,
      slotDefinition
    );
  }

  /**
  * Update amazon lex intent definition
  * @param lexApi
  * @param intentDefinition
  * @param version
  * Uses
  *  - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lex.html#getIntent-property
  *  - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lex.html#putIntent-property
  */
  private updateIntent = async (
    intentDefinition: Lex.PutIntentRequest,
    version: string = "$LATEST"
  ) => {
    // Ensure permission exists to call invoke dialogCodeHook if one is provided
    if (intentDefinition.dialogCodeHook != null) {
      await this.ensureIntentHasInvokePermission(
        intentDefinition.name,
        intentDefinition.dialogCodeHook.uri
      );
    }

    // Ensure permission exists to call invoke fulfillmentCodeHook if one is provided
    if (
      intentDefinition.fulfillmentActivity != null &&
      intentDefinition.fulfillmentActivity.codeHook != null
    ) {
      await this.ensureIntentHasInvokePermission(
        intentDefinition.name,
        intentDefinition.fulfillmentActivity.codeHook.uri
      );
    }

    // update the intent definition
    return this.updateLexResource(
      async () => {
        return this.getIntentChecksum({
          name: intentDefinition.name,
          version: version
        });
      },
      this.putIntent,
      intentDefinition
    );
  };

  /**
  * Update amazon lex bot definition
  * Uses
  * - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/LexModelBuildingService.html#getBot-property
  * - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/LexModelBuildingService.html#putBot-property
  *
  * @param botDefinition
  * @param versionOrAlias
  */
  private updateBot = async (
    botDefinition: Lex.PutBotRequest,
    versionOrAlias: string = "$LATEST"
  ) => {
    return this.updateLexResource(
      async () => {
        return this.getBotChecksum({
          name: botDefinition.name,
          versionOrAlias: versionOrAlias
        });
      },
      this.putBot,
      botDefinition
    );
  };

  /**
  * Update bot alias
  * @param botAlias
  */
  private updateBotAlias = async (alias: Lex.PutBotAliasRequest) => {
    return this.updateLexResource(
      async () => {
        return this.getBotAliasChecksum({
          name: alias.name,
          botName: alias.botName
        });
      },
      this.putBotAlias,
      alias
    );
  };

  /**
  * Update a bot and all associated slot-type/intent definitions
  * @param definitions
  */
  public updateFullBot = async (bot: BotDefinition) => {
    try {
      const definition = bot.toLexBotDefinitionRequest();

      // sequentially deploy each type definition
      for (const slotTypeDefinition of definition.slotTypeDefinitions) {
        await this.updateSlotType(slotTypeDefinition);
      }
      // sequentially deploy each intent definition
      for (const intentDefinition of definition.intentDefinitions) {
        await this.updateIntent(intentDefinition);
      }
      // deploy the bot definition
      await this.updateBot(definition.botDefinition);

      // deploy the aliases
      for (const alias of definition.aliases) {
        await this.updateBotAlias(alias);
      }

      const botMetadata = await this.getBotStatus({
        name: bot.name
      });
      console.log(`Bot: ${botMetadata.name} Status: ${botMetadata.status}`);
    } catch (err) {
      console.log("An error occurred", err.stack);
    }
  };

  /**
  * Update definition of provided botNames, if botNames is not given, updates all known bots
  * @param botNames
  */
  public updateBotWitLoaders = async (bots: Array<BotDefinition>) => {
    for (const bot of bots) {
      await this.updateFullBot(bot);
    }
  };
}
