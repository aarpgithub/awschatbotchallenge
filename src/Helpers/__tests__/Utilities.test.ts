import { excludeNil, sha256checksum } from "../Utilities";

it("excludeNil should remove null/undefined values from top-level of object", () => {
  const testcase = { a: 1, b: "1", c: null, d: undefined, e: { a: 1 } };
  expect(excludeNil(testcase)).toMatchSnapshot();
});

it("sha256checksum of object should produce expected checksum value", () => {
  const testcase = { a: 1, b: "1", c: null, d: undefined, e: { a: 1 } };
  expect(sha256checksum(testcase)).toMatchSnapshot();
});
