// Validator
// * use for validating form data
const chineseReg = /[\u3000\u3400-\u4DBF\u4E00-\u9FFF]/;
const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

export interface ValidatorConfig {
  // is email
  isEmail?: boolean;
  // not empty
  notEmpty: boolean;
  // min length
  minLength: number;
  // max length
  maxLength: number;
  // no space
  noSpace: boolean;
  // no chinese
  noChinese: boolean;
}

export function validate(text: string, config: Partial<ValidatorConfig>): { result: boolean; reason: string } {
  if (config.notEmpty) {
    if (text.length === 0) {
      return {
        result: false,
        reason: "Content is empty",
      };
    }
  }
  if (config.minLength !== undefined) {
    if (text.length < config.minLength) {
      return {
        result: false,
        reason: "Too short",
      };
    }
  }

  if (config.maxLength !== undefined) {
    if (text.length > config.maxLength) {
      return {
        result: false,
        reason: "Too long",
      };
    }
  }

  if (config.noSpace && text.includes(" ")) {
    return {
      result: false,
      reason: "Don't allow space",
    };
  }

  if (config.noChinese && chineseReg.test(text)) {
    return {
      result: false,
      reason: "Don't allow chinese",
    };
  }

  if (config.isEmail && !emailReg.test(text)) {
    return {
      result: false,
      reason: "Email address is invalid",
    };
  }

  return {
    result: true,
    reason: "",
  };
}
