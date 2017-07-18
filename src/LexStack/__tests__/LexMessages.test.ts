import {
  createDelegateAction,
  createElicitSlotAction,
  createPlainTextMessage,
  createElicitIntentAction,
  createConfirmAction,
  createCloseAction
} from "../../Lexstack";

import { removeKeysRecursive } from "../../Helpers";

it("Should be able to create a plaintext message", () => {
  const m = createPlainTextMessage("sample message");
  expect(m).toMatchSnapshot();
});
it("Should be able to create a Delegate Action", () => {
  const m = createDelegateAction({
    slots: {}
  });
});
it("Should be able to create a Close Action", () => {
  const m = createCloseAction({
    fulfillmentState: "Fulfilled",
    message: createPlainTextMessage("test")
  });
  expect(m).toMatchSnapshot();
});
it("Should be able to create a Confirm action", () => {
  const m = createConfirmAction({
    // TODO: fix this
    slots: {},
    message: createPlainTextMessage("sample message")
  });
  expect(m).toMatchSnapshot();
});
it("Should be able to create a plaintext message", () => {
  const m = createPlainTextMessage("sample message");
  expect(m).toMatchSnapshot();
});
