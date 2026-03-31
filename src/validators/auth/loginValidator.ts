// Local Modules
import { bodyPassword, bodyUsername } from "#src/validators/commonValidators";

export const loginValidators = [bodyUsername(), bodyPassword()];
