import { Validator, IsString } from "class-validator";
import { LexService, BotConfiguration } from "../LexService";

/**
 * Create a BotConfiguration compatible object from a serverless configuration object
 * Be VERY STRICT about validation of these options to avoid configuration errors going
 * undetected or manifesting  in bad ways elsewhere in the system.
 * 
 * !! Remember typescript does compile-time validation only !!  
 * Objects of type :any spread errors - so usage of properties of an :any typed object should be
 * checked at runtime whenever possible.
 */
export class ServerlessBotConfig implements BotConfiguration {
  private serverless: any;
  private options: any;
  public lexTestMode: boolean;

  @IsString({
    message:
      "Serviceless property: custom.stage must be a string.  Found $value"
  })
  get stage(): string {
    return this.serverless.service.custom.stage;
  }

  @IsString({
    message:
      "Serviceless property: custom.config.OWNER_ID must be a string.  Found $value"
  })
  get ownerId(): string {
    return this.serverless.service.custom.config.OWNER_ID;
  }

  @IsString({
    message:
      "Serviceless property: provider.region must be a string.  Found $value"
  })
  get region(): string {
    return this.serverless.service.provider.region;
  }

  @IsString({
    message:
      "Serviceless property: provider.profile must be a string.  Found $value"
  })
  get profile(): string {
    return this.serverless.service.provider.profile;
  }

  constructor(serverless: any, options: any, lexTestMode: boolean = false) {
    this.serverless = serverless;
    this.options = options;
    this.lexTestMode = lexTestMode;
    this.validate();
  }

  validate() {
    const validator = new Validator();
    const errors = validator.validateSync(this);

    if (errors.length > 0) {
      let errMessage =
        "DeployLexBotServerlessPlugin: Error validating serverless config\n";
      for (const err of errors) {
        for (const key in err.constraints) {
          const failureMessage = err.constraints[key];
          errMessage += failureMessage;
        }
      }
      console.log(errMessage);
      throw errMessage;
    }
  }
}
