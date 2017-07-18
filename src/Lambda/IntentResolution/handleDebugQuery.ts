// "use strict";

// import * as AWS from "aws-sdk";

// import {
//   Callback as LambdaCallback,
//   Context as LambdaContext
// } from "aws-lambda";

// import {
//   LambdaBotConfig,
//   BotMap,
//   KnownIntentName,
//   LambdaEventInput,
//   LambdaEventResponse,
//   createCloseAction,
//   createElicitSlotAction,
//   createElicitIntentAction,
//   createPlainTextMessage,
// } from "../../LexStack";

// const c = new LambdaBotConfig(false);
// const botMap = BotMap(c);
// type BotNames = keyof typeof botMap;

// // --------------- Main handler -----------------------
// export const handler = async (
//   event: LambdaEventInput,
//   context: LambdaContext,
//   callback: AWSLambda.Callback
// ) => {
//   console.log("in handler event ");
//   try {
//     var intentName = event.currentIntent.name;
//     console.log("intent name is " + intentName);
//     const response = await dispatchIntentRequest(event, context);
//     console.log("Response computed successfully", response);
//     callback(undefined, response);
//   } catch (err) {
//     console.log("Error while handling response");
//     callback(err, undefined);
//   }
// };

// const dispatchIntentRequest = async (
//   event: LambdaEventInput,
//   context: LambdaContext
// ): Promise<LambdaEventResponse> => {
//   switch (event.invocationSource) {
//     case "DialogCodeHook":
//       return await dispatchDialogHookRequest(event, context);
//     case "FulfillmentHook":
//       return await dispatchFulfillmentHookRequest(event, context);
//   }
// };

// const dispatchDialogHookRequest = async (
//   event: LambdaEventInput,
//   context: LambdaContext
// ): Promise<LambdaEventResponse> => {
//   const requestedIntentName = event.currentIntent.name;
//   const botName = event.bot.name;
//   const bot = botMap[botName];

//   if (bot == null) {
//     throw Error(`Received message from unknown bot: ${botName}`);
//   }

//   for (const intent of bot.intents) {
//     if (requestedIntentName == intent.name) {
//       const validationMessages = await intent.validateSession(event);
//       return dispatchValidationResult(
//         event,
//         context,
//         intent.name,
//         validationMessages
//       );
//     }
//   }
//   throw Error(`Received unknown intent: ${requestedIntentName}`);
// };

// const dispatchValidationResult = (
//   event: LambdaEventInput,
//   context: LambdaContext,
//   intentName: string,
//   validationMessages: Array<SlotValidationMessage> | undefined
// ): LambdaEventResponse => {
//   if (validationMessages == null) {
//     return {
//       sessionAttributes: event.sessionAttributes,
//       dialogAction: createCloseAction({
//         fulfillmentState: "Fulfilled",
//         message: createPlainTextMessage(
//           `Debug Representation: ${JSON.stringify(event.sessionAttributes)}`
//         )
//       })
//     };
//   }

//   if (validationMessages.length == 0) {
//     throw Error("Programming error: this should not be possible");
//   }

//   const firstFailedSlot = validationMessages[0];

//   if (firstFailedSlot.userValidationMessage == null) {
//     throw Error("Programming error: this should not be possible");
//   }

//   return {
//     sessionAttributes: event.sessionAttributes,
//     dialogAction: createElicitSlotAction({
//       intentName: intentName,
//       slotToElicit: firstFailedSlot.slotName,
//       message: createPlainTextMessage(firstFailedSlot.userValidationMessage)
//     })
//   };
// };

// const dispatchFulfillmentHookRequest = async (
//   event: LambdaEventInput,
//   context: LambdaContext
// ): Promise<LambdaEventResponse> => {
//   const response: LambdaEventResponse = {
//     sessionAttributes: event.sessionAttributes,
//     dialogAction: createCloseAction({
//       fulfillmentState: "Fulfilled",
//       message: createPlainTextMessage(
//         `SessionAttributes: ${JSON.stringify(event.sessionAttributes)}`
//       )
//     })
//   };
//   return Promise.resolve(response);
// };

// // function buildValidationResult(
// //   isValid: any,
// //   violatedSlot: any,
// //   messageContent: any,
// //   outputSessionAttributes: any
// // ) {
// //   if (messageContent == null) {
// //     return {
// //       isValid,
// //       violatedSlot,
// //       outputSessionAttributes,
// //       message: null
// //     };
// //   }
// //   return {
// //     isValid,
// //     violatedSlot,
// //     message: { contentType: "PlainText", content: messageContent },
// //     outputSessionAttributes
// //   };
// // }

// // function getStateCode(stateNameOrStateCode: any) {
// //   var stateCode = states.sanitizeStateCode(stateNameOrStateCode);
// //   var stateName = states.sanitizeStateName(stateNameOrStateCode);
// //   var stateCodeToBeReturned = null;
// //   console.log("state code or state name " + stateCode + " " + stateName);

// //   if (stateCode) {
// //     stateCodeToBeReturned = stateCode;
// //     console.log(
// //       `got statecode ${stateCode} resolved to state code as ${stateCodeToBeReturned}`
// //     );
// //   }

// //   if (stateName) {
// //     stateCodeToBeReturned = states.getStateCodeByStateName(stateName);
// //     console.log(
// //       `got statename ${stateName} resolved to state code as ${stateCodeToBeReturned}`
// //     );
// //   }

// //   console.log(`returning state code as ${stateCodeToBeReturned}`);
// //   return stateCodeToBeReturned;
// // }

// // function isValidIncome(incomeLevel: any) {
// //   try {
// //     return !isNaN(incomeLevel);
// //   } catch (err) {
// //     return false;
// //   }
// // }

// // function validateHealthCareToolInputs(
// //   insuranceType: any,
// //   stateName: any,
// //   incomeLevel: any,
// //   outputSessionAttributes: any
// // ) {
// //   console.log("in validate health care tool inputs");
// //   console.log(
// //     `slot values are ${insuranceType} : ${stateName} : ${incomeLevel}`
// //   );

// //   const insuranceTypes = ["private", "employer"];

// //   try {
// //     if (
// //       insuranceType &&
// //       insuranceTypes.indexOf(insuranceType.toLowerCase()) === -1
// //     ) {
// //       console.log("validating insurance types");
// //       return buildValidationResult(
// //         false,
// //         "InsuranceType",
// //         `We do not support ${insuranceType}. Please speak or choose either PRIVATE or EMPLOYER, insurance type`,
// //         outputSessionAttributes
// //       );
// //     }
// //   } catch (err) {
// //     console.log("error while validating insurance type " + err);
// //   }

// //   try {
// //     if (stateName) {
// //       console.log("validating state name");
// //       var validatedStateCode = getStateCode(stateName);
// //       outputSessionAttributes.stateCodeToBeUsed = validatedStateCode;
// //       if (!validatedStateCode) {
// //         return buildValidationResult(
// //           false,
// //           "StateName",
// //           "I did not understand that, which state do you reside in?",
// //           outputSessionAttributes
// //         );
// //       }
// //     }
// //   } catch (err) {
// //     console.log("error while state name " + err);
// //   }

// //   try {
// //     if (incomeLevel) {
// //       console.log("validating income level");
// //       if (!isValidIncome(incomeLevel)) {
// //         return buildValidationResult(
// //           false,
// //           "IncomeLevel",
// //           "I did not understand that, what is your income level?",
// //           outputSessionAttributes
// //         );
// //       }
// //     }
// //   } catch (err) {
// //     console.log("error while income level " + err);
// //   }

// //   return buildValidationResult(true, null, null, outputSessionAttributes);
// // }

// // function getInsurancePremium(intentRequest: any, callback: any) {
// //   const source = intentRequest.invocationSource;
// //   const insuranceType = intentRequest.currentIntent.slots.InsuranceType;
// //   const stateName = intentRequest.currentIntent.slots.StateName;
// //   const incomeLevel = intentRequest.currentIntent.slots.IncomeLevel;
// //   const outputSessionAttributes = intentRequest.sessionAttributes || {};

// //   if (source === "DialogCodeHook") {
// //     console.log("in dialog code hook");
// //     // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
// //     const slots = intentRequest.currentIntent.slots;
// //     const validationResult = validateHealthCareToolInputs(
// //       insuranceType,
// //       stateName,
// //       incomeLevel,
// //       outputSessionAttributes
// //     );
// //     if (!validationResult.isValid) {
// //       slots[`${validationResult.violatedSlot}`] = null;
// //       callback(
// //         elicitSlot(
// //           outputSessionAttributes,
// //           intentRequest.currentIntent.name,
// //           slots,
// //           validationResult.violatedSlot,
// //           validationResult.message
// //         )
// //       );
// //       return;
// //     }

// //     if (insuranceType === "employer") {
// //       var employerInsuranceResponse = Env.getString("EMPLOYER_STATIC_TEXT");
// //       var employerFulfillmentState = "Employer Insurance";
// //       callback(
// //         close(intentRequest.sessionAttributes, "Fulfilled", {
// //           contentType: "PlainText",
// //           content: `${employerFulfillmentState} ${employerInsuranceResponse}`
// //         })
// //       );
// //     } else {
// //       callback(
// //         delegate(outputSessionAttributes, intentRequest.currentIntent.slots)
// //       );
// //     }

// //     return;
// //   }

// //   var intentName = intentRequest.currentIntent.name;
// //   console.log(
// //     "fetch insurance premium request received for intentName = " + intentName
// //   );

// //   var fulfillmentState = "Your selected slots are as follows: ";
// //   var eventsResponseAsString =
// //     "Insurance type is " +
// //     insuranceType +
// //     " state name is " +
// //     stateName +
// //     " income level is" +
// //     incomeLevel;
// //   var dataFromDb = "";
// //   var incomeAppdender = "20";
// //   var keyValueToSearch = "";

// //   if (incomeLevel < 30000) {
// //     incomeAppdender = "20";
// //   } else if (incomeLevel >= 30000 && incomeLevel < 40000) {
// //     incomeAppdender = "30";
// //   } else if (incomeLevel >= 40000 && incomeLevel < 45000) {
// //     incomeAppdender = "40";
// //   } else if (incomeLevel >= 45000 && incomeLevel < 50000) {
// //     incomeAppdender = "45";
// //   } else if (incomeLevel >= 50000 && incomeLevel < 55000) {
// //     incomeAppdender = "50";
// //   } else if (incomeLevel >= 55000 && incomeLevel < 60000) {
// //     incomeAppdender = "55";
// //   } else if (incomeLevel >= 60000) {
// //     incomeAppdender = "60";
// //   }

// //   keyValueToSearch =
// //     outputSessionAttributes.stateCodeToBeUsed + incomeAppdender;
// //   console.log("income appdender " + incomeAppdender);
// //   console.log("key value to search " + keyValueToSearch);

// //   var scanningParameters = {
// //     TableName: "HealthCarePremiums",
// //     KeyConditionExpression: "#myid = :id",
// //     ExpressionAttributeNames: {
// //       "#myid": "stateAndIncome"
// //     },
// //     ExpressionAttributeValues: {
// //       ":id": keyValueToSearch
// //     }
// //   };

// //   console.log("Income level found in session " + incomeLevel);

// //   docClient.query(scanningParameters, function(err, data: any) {
// //     if (err) {
// //       console.log("DynamoDB call resulted in error " + err);
// //       dataFromDb = "error from DB call";
// //     } else {
// //       dataFromDb = "table 20 percent off ";
// //       data.Items.forEach(function(item: any) {
// //         console.log(item.stateAndIncome + ": " + item.premium);
// //         dataFromDb = item.premium;
// //       });
// //       console.log("data from dynamo db :" + dataFromDb);
// //     }

// //     eventsResponseAsString =
// //       eventsResponseAsString + " premium is " + dataFromDb;

// //     callback(
// //       close(intentRequest.sessionAttributes, "Fulfilled", {
// //         contentType: "PlainText",
// //         content: `${fulfillmentState} ${eventsResponseAsString}`
// //       })
// //     );
// //   });
// // }
