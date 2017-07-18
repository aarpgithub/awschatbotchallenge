declare module "serverless" {
  class Serverless {
    invocationId: string;
    constructor();
    constructor(config: any);
    [k: string]: any;
  }
  export = Serverless;
}

declare module "serverless/lib/classes/CLI" {
  class CLI {
    constructor(serverless: any, inputArray: any);
    init(): Promise<any>;
    [k: string]: any;
  }

  export = CLI;
}
