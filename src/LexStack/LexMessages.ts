import { LexModelBuildingService as Lex } from "aws-sdk";
import { Context as LambdaContext } from "aws-lambda";

export interface LambdaEventInput {
  currentIntent: CurrentIntent;
  bot: BotDescriptor;
  userId: string;
  inputTranscript: string;
  invocationSource: InvocationSource;
  outputDialogMode: OutputDialogMode;
  messageVersion: MessageVersion;
  sessionAttributes: SessionAttributes;
}

export type CurrentIntent = {
  name: Lex.IntentName;
  slots: Slots;
  confirmationStatus: ConfirmationStatus;
};

export type Slots = {
  [slotName: string]: [string | null];
};

export type ConfirmationStatus = "None" | "Confirmed" | "Denied";

export type BotDescriptor = {
  name: Lex.BotName;
  alias: Lex.AliasName;
  version: Lex.Version;
};

export type InvocationSource = "FulfillmentHook" | "DialogCodeHook";

export type OutputDialogMode = "Text" | "Voice";

export type MessageVersion = string;

export type SessionAttributes = {
  [k: string]: string;
};

export interface LambdaEventResponse {
  sessionAttributes: SessionAttributes;
  dialogAction: DialogAction;
}

export type DialogAction =
  | CloseAction
  | ConfirmIntentAction
  | DelegateAction
  | ElicitIntentAction
  | ElicitSlotAction;

export type FulfillmentState = "Fulfilled" | "Failed";

export interface CloseAction {
  ["type"]: "Close";
  fulfillmentState: FulfillmentState;
  message: Lex.Message;
  responseCard?: ResponseCard;
}

export const createPlainTextMessage = (message: string): Lex.Message => {
  return {
    content: message,
    contentType: "PlainText"
  };
};

export const createCloseAction = (
  params: Pick<CloseAction, "fulfillmentState" | "message" | "responseCard">
): CloseAction => {
  return {
    ...params,
    ["type"]: "Close"
  };
};

export interface ConfirmIntentAction {
  ["type"]: "ConfirmIntent";
  message: Lex.Message;
  slots: Slots;
  responseCard?: ResponseCard;
}

export const createConfirmAction = (
  params: Pick<ConfirmIntentAction, "message" | "slots" | "responseCard">
): ConfirmIntentAction => {
  return {
    ...params,
    ["type"]: "ConfirmIntent"
  };
};

export interface DelegateAction {
  ["type"]: "Delegate";
  slots: Slots;
}

export const createDelegateAction = (
  params: Pick<DelegateAction, "slots">
): DelegateAction => {
  return {
    ...params,
    ["type"]: "Delegate"
  };
};

export interface ElicitIntentAction {
  ["type"]: "ElicitIntent";
  message: Lex.Message;
  responseCard: ResponseCard;
}

export const createElicitIntentAction = (
  params: Pick<ElicitIntentAction, "message" | "responseCard">
): ElicitIntentAction => {
  return {
    ...params,
    ["type"]: "ElicitIntent"
  };
};

export interface ElicitSlotAction {
  ["type"]: "ElicitSlot";
  message: Lex.Message;
  intentName: Lex.IntentName;
  slotToElicit: Lex.SlotName;
  responseCard?: ResponseCard;
}

export const createElicitSlotAction = (
  params: Pick<
    ElicitSlotAction,
    "message" | "intentName" | "slotToElicit" | "responseCard"
  >
): ElicitSlotAction => {
  return {
    ...params,
    ["type"]: "ElicitSlot"
  };
};

export type ResponseCard = {
  version: number;
  contentType: "application/vnd.amazonaws.card.generic";
  genericAttachments: Array<GenericAttachment>;
};

export type GenericAttachment = {
  title: "card-title";
  subTitle: "card-sub-title";
  imageUrl: "URL of the image to be shown";
  attachmentLinkUrl: "URL of the attachment to be associated with the card";
  buttons: Array<ResponseButton>;
};

export type ResponseButton = {
  // label for button
  text: string;
  // value sent to server on button click
  value: string;
};
