import { isNil } from "lodash";
import { createHash } from "crypto";
import traverse = require("traverse");
import { union as lodash_union, flatten as lodash_flatten } from "lodash";

/**
 * Remove any keys with undefined or null values from obj and return obj.  
 * !! Mutates argument !!
 * 
 * example: 
 *  const obj = {a: null, b: 1}
 *  const obj2 = excludeNil(obj)
 *  console.log(obj2)
 * -> "{ b: 1}"
 * @param obj 
 */
export function excludeNil<T>(obj: T): T {
  for (const key in obj) {
    if (isNil(obj[key])) {
      delete obj[key];
    }
  }
  return obj;
}

export const sha256 = (str: string): string => {
  const hash = createHash("sha256");
  hash.update(str);
  return hash.digest("hex");
};

export const sha256checksum = (obj: Object): string => {
  return sha256(JSON.stringify(obj));
};

export const removeKeysRecursive = (obj: any, keys: Array<String>) => {
  traverse(obj).forEach(function(e: any) {
    if (this.key && containsKey(this.key, keys)) {
      this.remove(true);
    }
  });
};

export const containsKey = (key: string, keys: Array<String>) => {
  if (keys.indexOf(key) > -1) {
    return true;
  }
  return false;
};

export const snooze = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const union = lodash_union;
export const flatten = lodash_flatten;
