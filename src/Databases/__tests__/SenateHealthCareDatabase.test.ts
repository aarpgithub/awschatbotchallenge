import { HealthCarePremiumTable } from "../SenateHealthCareDatabase";

it("HealthCarePremiumTable items should have expected keys", () => {
  const item = HealthCarePremiumTable().items[0];
  expect(Object.keys(item)).toMatchSnapshot();
});

it("HealthCarePremiumTable should export a database with expected metadata and items", () => {
  const table = HealthCarePremiumTable();
  expect(table).toMatchSnapshot();
});
