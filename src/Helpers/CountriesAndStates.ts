import states = require("us-state-codes");

export const stateNameToCode = (state: string) => {
  let stateCode = states.sanitizeStateName(state);
  if (stateCode == null) {
    throw Error(`Error missing field state.  Input: ${state}`);
  }
  stateCode = states.getStateCodeByStateName(stateCode);
  if (stateCode == null) {
    throw Error("Error converting state to code.  Input: ${state}");
  }
  return stateCode;
};
