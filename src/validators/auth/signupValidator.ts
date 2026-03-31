// Local Modules
import {
  bodyPassword,
  bodyEmail,
  bodyUsername,
} from "#src/validators/commonValidators";

export const signupValidators = [bodyUsername(), bodyEmail(), bodyPassword()];
