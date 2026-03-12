import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { submitLoginPage, submitLogoutPage } from "../pages/login.page";
import { loginState } from "../state/login.state";
import { validateLoginInput } from "../validators/login-form.validator";

@Component({
  selector: "mp-public-login-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login-page.component.html",
  styleUrl: "./login-page.component.css",
})
export class LoginPageComponent implements OnInit {
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isAuthenticated = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly successMessage = signal<string | undefined>(undefined);
  readonly form;

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    void this.restoreSession();
  }

  async onSubmit(): Promise<void> {
    this.error.set(undefined);
    this.successMessage.set(undefined);

    const values = this.form.getRawValue();
    const validationErrors = validateLoginInput(values);

    if (validationErrors.length > 0) {
      this.error.set(validationErrors[0]);
      return;
    }

    this.submitting.set(true);

    try {
      const session = await submitLoginPage(values);
      this.isAuthenticated.set(session.isAuthenticated);
      this.successMessage.set("Login realizado com sucesso.");
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : "Falha ao realizar login.",
      );
    } finally {
      this.submitting.set(false);
    }
  }

  async onLogout(): Promise<void> {
    this.error.set(undefined);
    this.successMessage.set(undefined);
    this.submitting.set(true);

    try {
      await submitLogoutPage();
      this.isAuthenticated.set(false);
      this.successMessage.set("Sessão encerrada com sucesso.");
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : "Falha ao encerrar sessão.",
      );
    } finally {
      this.submitting.set(false);
    }
  }

  private async restoreSession(): Promise<void> {
    this.loading.set(true);

    try {
      await loginState.restoreSession();
      this.isAuthenticated.set(!!loginState.value.session?.isAuthenticated);
    } catch {
      this.error.set("Não foi possível restaurar a sessão atual.");
    } finally {
      this.loading.set(false);
    }
  }
}
