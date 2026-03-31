// Local Module
import type { CustomError } from "#src/lib/CustomError";

export type CustomNextFunction = {
  (err?: CustomError): void;
  (deferToNext: "router"): void;
  (deferToNext: "route"): void;
};
