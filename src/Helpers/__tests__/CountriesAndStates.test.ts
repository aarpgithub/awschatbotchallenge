import { stateNameToCode } from "../CountriesAndStates";

it("Should produce the correct abbreviation for example state names", () => {
  const testCases = ["California", "Nevada", "Washington"];
  const codes = testCases.map(e => {
    return stateNameToCode(e);
  });
  expect(codes).toMatchSnapshot();
});

it("Should throw an error on invalid state names", () => {
  const shouldThrow = () => {
    return stateNameToCode("Kalifornia");
  };

  expect(shouldThrow).toThrowErrorMatchingSnapshot();
});
