import { describe, expect, it } from "vitest";
import * as publicComponents from "../../index";
import * as login from "../index";
import * as models from "../models";
import * as services from "../services";
import * as state from "../state";
import * as pages from "../pages";
import * as components from "../components";
import * as validators from "../validators";
import * as mock from "../mock";

describe("login-page barrel exports", () => {
  it("exposes expected symbols from barrels", () => {
    expect(publicComponents.loginService).toBeDefined();
    expect(login.loginState).toBeDefined();
    expect(models).toBeDefined();
    expect(services.LoginService).toBeDefined();
    expect(state.LoginState).toBeDefined();
    expect(pages.submitLoginPage).toBeTypeOf("function");
    expect(components.createLoginFormModel).toBeTypeOf("function");
    expect(validators.validateLoginInput).toBeTypeOf("function");
    expect(mock.LoginMockProvider).toBeDefined();
  });
});
