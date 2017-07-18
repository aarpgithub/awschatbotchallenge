"use strict";

import * as AWS from "aws-sdk";
import * as AWSLambda from "aws-lambda";

import bluebird = require("bluebird");
import request_with_callbacks = require("request");
const request: any = bluebird.promisifyAll(request_with_callbacks);

import states = require("us-state-codes");
import { Env } from "../../Helpers";

const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

// --------------- Main handler -----------------------
export const handler: AWSLambda.Handler = (
  event,
  context,
  callback: AWSLambda.Callback
) => {
  console.log("in handler event ");
  try {
    var intentName = event.currentIntent.name;
    console.log("intent name is " + intentName);

    if (intentName === "PremiumQueryIntent") {
      getInsurancePremium(event, (response: any) => {
        callback(undefined, response);
      });
    } else {
      console.log("Other intents removed");
    }
  } catch (err) {
    callback(err);
  }
};

function elicitSlot(
  sessionAttributes: any,
  intentName: any,
  slots: any,
  slotToElicit: any,
  message: any
) {
  return {
    sessionAttributes,
    dialogAction: {
      type: "ElicitSlot",
      intentName,
      slots,
      slotToElicit,
      message
    }
  };
}

function close(sessionAttributes: any, fulfillmentState: any, message: any) {
  return {
    sessionAttributes,
    dialogAction: {
      type: "Close",
      fulfillmentState,
      message
    }
  };
}

function delegate(sessionAttributes: any, slots: any) {
  return {
    sessionAttributes,
    dialogAction: {
      type: "Delegate",
      slots
    }
  };
}

function buildValidationResult(
  isValid: any,
  violatedSlot: any,
  messageContent: any,
  outputSessionAttributes: any
) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot,
      outputSessionAttributes,
      message: null
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: "PlainText", content: messageContent },
    outputSessionAttributes
  };
}

function getStateCode(stateNameOrStateCode: any) {
  var stateCode = states.sanitizeStateCode(stateNameOrStateCode);
  var stateName = states.sanitizeStateName(stateNameOrStateCode);
  var stateCodeToBeReturned = null;
  console.log("state code or state name " + stateCode + " " + stateName);

  if (stateCode) {
    stateCodeToBeReturned = stateCode;
    console.log(
      `got statecode ${stateCode} resolved to state code as ${stateCodeToBeReturned}`
    );
  }

  if (stateName) {
    stateCodeToBeReturned = states.getStateCodeByStateName(stateName);
    console.log(
      `got statename ${stateName} resolved to state code as ${stateCodeToBeReturned}`
    );
  }

  console.log(`returning state code as ${stateCodeToBeReturned}`);
  return stateCodeToBeReturned;
}

function isValidIncome(incomeLevel: any) {
  try {
    return !isNaN(incomeLevel);
  } catch (err) {
    return false;
  }
}

function validateHealthCareToolInputs(
  insuranceType: any,
  stateName: any,
  incomeLevel: any,
  outputSessionAttributes: any
) {
  console.log("in validate health care tool inputs");
  console.log(
    `slot values are ${insuranceType} : ${stateName} : ${incomeLevel}`
  );

  const insuranceTypes = ["private", "employer"];

  try {
    if (
      insuranceType &&
      insuranceTypes.indexOf(insuranceType.toLowerCase()) === -1
    ) {
      console.log("validating insurance types");
      return buildValidationResult(
        false,
        "InsuranceType",
        `We do not support ${insuranceType}. Please speak or choose either PRIVATE or EMPLOYER, insurance type`,
        outputSessionAttributes
      );
    }
  } catch (err) {
    console.log("error while validating insurance type " + err);
  }

  try {
    if (stateName) {
      console.log("validating state name");
      var validatedStateCode = getStateCode(stateName);
      outputSessionAttributes.stateCodeToBeUsed = validatedStateCode;
      if (!validatedStateCode) {
        return buildValidationResult(
          false,
          "StateName",
          "I did not understand that, which state do you reside in?",
          outputSessionAttributes
        );
      }
    }
  } catch (err) {
    console.log("error while state name " + err);
  }

  try {
    if (incomeLevel) {
      console.log("validating income level");
      if (!isValidIncome(incomeLevel)) {
        return buildValidationResult(
          false,
          "IncomeLevel",
          "I did not understand that, what is your income level?",
          outputSessionAttributes
        );
      }
    }
  } catch (err) {
    console.log("error while income level " + err);
  }

  return buildValidationResult(true, null, null, outputSessionAttributes);
}

function getInsurancePremium(intentRequest: any, callback: any) {
  const source = intentRequest.invocationSource;
  const insuranceType = intentRequest.currentIntent.slots.InsuranceType;
  const stateName = intentRequest.currentIntent.slots.StateName;
  const incomeLevel = intentRequest.currentIntent.slots.IncomeLevel;
  const outputSessionAttributes = intentRequest.sessionAttributes || {};

  if (source === "DialogCodeHook") {
    console.log("in dialog code hook");
    // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateHealthCareToolInputs(
      insuranceType,
      stateName,
      incomeLevel,
      outputSessionAttributes
    );
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(
        elicitSlot(
          outputSessionAttributes,
          intentRequest.currentIntent.name,
          slots,
          validationResult.violatedSlot,
          validationResult.message
        )
      );
      return;
    }

    if (insuranceType === "employer") {
      var employerInsuranceResponse = Env.getString("EMPLOYER_STATIC_TEXT");
      var employerFulfillmentState = "Employer Insurance";
      callback(
        close(intentRequest.sessionAttributes, "Fulfilled", {
          contentType: "PlainText",
          content: `${employerFulfillmentState} ${employerInsuranceResponse}`
        })
      );
    } else {
      callback(
        delegate(outputSessionAttributes, intentRequest.currentIntent.slots)
      );
    }

    return;
  }

  var intentName = intentRequest.currentIntent.name;
  console.log(
    "fetch insurance premium request received for intentName = " + intentName
  );

  var fulfillmentState = "Your selected slots are as follows: ";
  var eventsResponseAsString =
    "Insurance type is " +
    insuranceType +
    " state name is " +
    stateName +
    " income level is " +
    incomeLevel;
  var dataFromDb = "";
  var incomeAppdender = "20";
  var keyValueToSearch = "";

  if (incomeLevel < 30000) {
    incomeAppdender = "20";
  } else if (incomeLevel >= 30000 && incomeLevel < 40000) {
    incomeAppdender = "30";
  } else if (incomeLevel >= 40000 && incomeLevel < 45000) {
    incomeAppdender = "40";
  } else if (incomeLevel >= 45000 && incomeLevel < 50000) {
    incomeAppdender = "45";
  } else if (incomeLevel >= 50000 && incomeLevel < 55000) {
    incomeAppdender = "50";
  } else if (incomeLevel >= 55000 && incomeLevel < 60000) {
    incomeAppdender = "55";
  } else if (incomeLevel >= 60000) {
    incomeAppdender = "60";
  }

  keyValueToSearch =
    outputSessionAttributes.stateCodeToBeUsed + incomeAppdender;
  console.log("income appender " + incomeAppdender);
  console.log("key value to search " + keyValueToSearch);

  var scanningParameters = {
    TableName: "HealthCarePremiums",
    KeyConditionExpression: "#myid = :id",
    ExpressionAttributeNames: {
      "#myid": "stateAndIncome"
    },
    ExpressionAttributeValues: {
      ":id": keyValueToSearch
    }
  };

  console.log("Income level found in session " + incomeLevel);

  docClient.query(scanningParameters, function(err, data: any) {
    if (err) {
      console.log("DynamoDB call resulted in error " + err);
      dataFromDb = "error from DB call";
    } else {
      dataFromDb = "table 20 percent off ";
      data.Items.forEach(function(item: any) {
        console.log(item.stateAndIncome + ": " + item.premium);
        dataFromDb = item.premium;
      });
      console.log("data from dynamo db :" + dataFromDb);
    }

    eventsResponseAsString =
      eventsResponseAsString + " premium is " + dataFromDb;

    callback(
      close(intentRequest.sessionAttributes, "Fulfilled", {
        contentType: "PlainText",
        content: `${fulfillmentState} ${eventsResponseAsString}`
      })
    );
  });
}
