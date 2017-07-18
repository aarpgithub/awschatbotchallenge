import { Env } from "../Env";

it("Env.getInt() should expose number properties as numbers or null", () => {
  const testcases = ["one", "two", "three"];
  const samples = testcases.map(e => {
    return Env.getInt(e);
  });
  expect(samples).toMatchSnapshot();
});

it("Env.getString() should expose string properties as strings of null", () => {
  const testcases = ["one", "two", "three"];
  const samples = testcases.map(e => {
    return Env.getInt(e);
  });
  expect(samples).toMatchSnapshot();
});
