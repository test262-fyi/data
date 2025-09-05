import { $$ } from "../../cli.js";

export default (file, module = false) => {
  const args = ["--no-strict", "--expose-internals", file];
  if (module) args.unshift("--module");

  return $$("./nova", ["eval", ...args]);
};
