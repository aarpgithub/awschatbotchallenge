export class Env {
  static getString(key: string): string {
    return process.env[key] || "";
  }

  static getInt(key: string): Number {
    return parseInt(process.env[key] || "0");
  }
}
