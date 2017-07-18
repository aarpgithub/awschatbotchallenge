import { BotConfiguration } from "../../LexStack";
import { Env } from "../../Helpers";
import { Validator, IsString } from "class-validator";

// TODO: move code around to reduce overlap with DeployLexbotServerlessPlugin:BotConfig
export class LambdaBotConfig implements BotConfiguration {
  lexTestMode: boolean;

  @IsString({
    message: "Env property: stage must be a string.  Found $value"
  })
  get stage(): string {
    return Env.getString("stage");
  }

  @IsString({
    message: "Env property: OWNER_ID must be a string.  Found $value"
  })
  get ownerId(): string {
    return Env.getString("OWNER_ID");
  }

  @IsString({
    message: "Env property: region must be a string.  Found $value"
  })
  get region(): string {
    return Env.getString("region");
  }

  @IsString({
    message: "Env property: profile must be a string.  Found $value"
  })
  get profile(): string {
    return Env.getString("profile");
  }

  constructor(lexTestMode: boolean = false) {
    this.lexTestMode = lexTestMode;
    this.validate();
  }

  validate() {
    const validator = new Validator();
    const errors = validator.validateSync(this);

    if (errors.length > 0) {
      let errMessage =
        "LambdaBotConfig: Error validating environment variables\n";
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
