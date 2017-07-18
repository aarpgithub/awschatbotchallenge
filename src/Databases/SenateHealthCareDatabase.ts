import { DynamoDB } from "aws-sdk";
import {
  DynamoDatabase,
  DynamoInterface
} from "../ServerlessPlugins/DeployDynamoDatabasePlugin";

import { readFileSync } from "fs";
import { join } from "path";

import { stateNameToCode } from "../Helpers";

const dbFilePath = join(
  __dirname,
  "../../resources/SenateHealthCareDatabase/senate_health_data.json"
);

class HealthCarePremiumTableSchema implements DynamoInterface {
  TableName = "HealthCarePremiumTable";
  KeySchema = [{ AttributeName: "stateAndIncome", KeyType: "HASH" }];
  AttributeDefinitions = [
    { AttributeName: "stateAndIncome", AttributeType: "S" }
  ];
  ProvisionedThroughput = {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  };
}

const HealthCarePremiumTableFields = [
  {
    fieldName: "stateAndIncome",
    fieldType: "S"
  },
  {
    fieldName: "state",
    fieldType: "S"
  },
  {
    fieldName: "income_range",
    fieldType: "S"
  },
  {
    fieldName: "premium",
    fieldType: "N"
  }
];

export const HealthCarePremiumTable: () => DynamoDatabase = () => {
  const items = JSON.parse(readFileSync(dbFilePath, "utf8"));
  const schema = new HealthCarePremiumTableSchema();

  const dynamoItems = items.map((item: any) => {
    let record: DynamoDB.PutItemInputAttributeMap = {};

    for (const field of HealthCarePremiumTableFields) {
      // eww, this is smelly
      let value;

      if (field.fieldName == "stateAndIncome") {
        value = stateNameToCode(item.state) + item.income_range;
      } else {
        value = item[field.fieldName];
      }

      if (value == null) {
        // hmm where to log this ...?
        // console.warn(
        //   `Missing value for field ${field.fieldName}.  In item: ${item}`
        // );
        continue;
      }

      if (field.fieldType == "N") {
        value = String(value);
      }

      record[field.fieldName] = {
        [field.fieldType]: value
      };
    }
    return record;
  });

  const db = new DynamoDatabase(schema, dynamoItems);

  return db;
};
