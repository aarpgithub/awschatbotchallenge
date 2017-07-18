import { Config, SharedIniFileCredentials, DynamoDB } from "aws-sdk";
import { Validator, IsString, IsArray, ValidateNested } from "class-validator";

export interface DynamoSchemaElement {
  fieldName: string;
  fieldType: string;
  isPrimary: boolean;
}

export interface DynamoInterface {
  TableName: string;
  KeySchema: DynamoDB.KeySchema;
  AttributeDefinitions: DynamoDB.AttributeDefinitions;
  ProvisionedThroughput: DynamoDB.ProvisionedThroughput;
}

export class DynamoDatabase {
  @ValidateNested() meta: DynamoInterface;
  @IsArray() items: Array<DynamoDB.PutItemInputAttributeMap>;

  constructor(
    meta: DynamoInterface,
    items: Array<DynamoDB.PutItemInputAttributeMap>
  ) {
    this.meta = meta;
    this.items = items;
    this.validate();
  }

  validate = () => {
    const validator = new Validator();
    const errors = validator.validateSync(this);

    if (errors.length > 0) {
      let errMessage =
        "DynamoDatabasePlugin: Error validating serverless config\n";
      for (const err of errors) {
        for (const key in err.constraints) {
          const failureMessage = err.constraints[key];
          errMessage += failureMessage;
        }
      }
      throw errMessage;
    }
  };
}

class DynamoConfig {
  private serverless: any;
  private options: any;

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

  @IsString({
    message: "Serviceless option: db must be a string.  Found $value"
  })
  get optionTargetTable() {
    return this.options.table;
  }

  @ValidateNested()
  get dbData(): DynamoDatabase {
    const table = this.optionTargetTable;
    return this.serverless.service.custom.dynamodb[table];
  }

  get dynamoDB() {
    const config = new Config({
      credentials: new SharedIniFileCredentials({ profile: this.profile }),
      region: this.region,
      apiVersions: {
        dynamodb: "2012-08-10"
      }
    });

    return new DynamoDB(config);
  }

  constructor(serverless: any, options: any) {
    this.serverless = serverless;
    this.options = options;
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
      throw errMessage;
    }
  }
}

export class DeployDynamoDbPlugin {
  serverless: any;
  options: any;
  commands: any;
  hooks: any;

  constructor(serverless: any, options: any) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      "deploy-dynamodb": {
        lifecycleEvents: ["uploadData"],
        usage: "Upload data to dynamodb",
        options: {
          table: {
            usage: "Specify name of dynamodb resource to configure",
            required: true
          }
        }
      }
    };

    this.hooks = {
      "deploy-dynamodb:uploadData": this.uploadData
    };
  }

  putItem = (dynamodb: DynamoDB, params: DynamoDB.PutItemInput) => {
    return dynamodb.putItem(params).promise();
  };

  putItems = (
    dynamodb: DynamoDB,
    params: DynamoDB.Types.BatchWriteItemInput
  ) => {
    return dynamodb.batchWriteItem(params);
  };

  uploadData = async () => {
    const config = new DynamoConfig(this.serverless, this.options);
    const dynamodb = config.dynamoDB;
    const dbData = config.dbData;

    const putItemsRequest: DynamoDB.Types.BatchWriteItemInput = {
      RequestItems: {
        [dbData.meta.TableName]: dbData.items
      }
    };

    try {
      await this.putItems(dynamodb, putItemsRequest);
    } catch (err) {
      console.log(
        `Error updating dynamodb table: ${dbData.meta.TableName}`,
        err.stack
      );
      throw err;
    }
  };
}
