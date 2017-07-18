// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

declare module "us-state-codes" {
  export function sanitizeStateCode(code?: string): string | null;
  export function getStateNameByStateCode(code?: string): string | null;
  export function sanitizeStateName(name?: string): string | null;
  export function getStateCodeByStateName(name?: string): string | null;
}
