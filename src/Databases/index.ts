import { HealthCarePremiumTable } from "./SenateHealthCareDatabase";

export const all = () => {
  return {
    HealthCarePremiumTable: HealthCarePremiumTable()
  };
};
