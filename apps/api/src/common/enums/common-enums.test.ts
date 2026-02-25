import { describe, expect, it } from "vitest";
import {
  AccessModifier,
  getAccessModifierName,
  getPrivilegeName,
  Privilege,
} from "./index";

describe("common enum helpers", () => {
  it("returns access modifier names", () => {
    expect(getAccessModifierName(AccessModifier.PUBLIC)).toBe("Public");
    expect(getAccessModifierName(AccessModifier.PROTECTED)).toBe("Protected");
    expect(getAccessModifierName(AccessModifier.PRIVATE)).toBe("Private");
    expect(getAccessModifierName(999 as AccessModifier)).toBe("Unknown");
  });

  it("returns privilege names", () => {
    expect(getPrivilegeName(Privilege.LOW)).toBe("Low");
    expect(getPrivilegeName(Privilege.MEDIUM)).toBe("Medium");
    expect(getPrivilegeName(Privilege.HIGH)).toBe("High");
    expect(getPrivilegeName(Privilege.MASTER)).toBe("Master");
    expect(getPrivilegeName(999 as Privilege)).toBe("Unknown");
  });
});
