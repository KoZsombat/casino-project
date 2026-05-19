// src/pages/Register.js
import "./Login.css";
import {
  renderAuthShell,
  showFormError,
  clearFormError,
} from "../components/auth/authShell.js";

const API_URL = import.meta.env.VITE_API_URL || "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function setupRegister(element, options = {}) {
  const navigate =
    options.navigate || ((path) => (window.location.hash = "#" + path));

  const { formSlot, errorBox } = renderAuthShell(element, {
    mode: "register",
    navigate,
    onBack: options.onBack,
  });

  formSlot.innerHTML = `
    <form class="auth-form" id="registerForm" novalidate>
      <div class="field">
        <label for="username">Felhasználónév</label>
        <input id="username" name="username" type="text" placeholder="pl. lucky_player" autocomplete="username" required />
        <span class="field-error" id="usernameError"></span>
      </div>

      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" placeholder="te@example.com" autocomplete="email" required />
        <span class="field-error" id="emailError"></span>
      </div>

      <div class="field">
        <label for="password">Jelszó</label>
        <input id="password" name="password" type="password" placeholder="legalább 6 karakter" autocomplete="new-password" required minlength="6" />
        <span class="field-error" id="passwordError"></span>
      </div>

      <div class="field">
        <label for="confirmPassword">Jelszó megerősítése</label>
        <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autocomplete="new-password" required />
        <span class="field-error" id="confirmPasswordError"></span>
      </div>

      <button class="btn-submit" type="submit" id="submitBtn">Regisztráció</button>
    </form>
  `;

  const form = formSlot.querySelector("#registerForm");
  const usernameInput = formSlot.querySelector("#username");
  const emailInput = formSlot.querySelector("#email");
  const passwordInput = formSlot.querySelector("#password");
  const confirmInput = formSlot.querySelector("#confirmPassword");
  const usernameErr = formSlot.querySelector("#usernameError");
  const emailErr = formSlot.querySelector("#emailError");
  const passwordErr = formSlot.querySelector("#passwordError");
  const confirmErr = formSlot.querySelector("#confirmPasswordError");
  const submitBtn = formSlot.querySelector("#submitBtn");

  function resetErrors() {
    clearFormError(errorBox);
    [usernameInput, emailInput, passwordInput, confirmInput].forEach((el) =>
      el.classList.remove("invalid"),
    );
    [usernameErr, emailErr, passwordErr, confirmErr].forEach(
      (el) => (el.textContent = ""),
    );
  }

  function setFieldError(input, span, msg) {
    input.classList.add("invalid");
    span.textContent = msg;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetErrors();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    let hasError = false;
    if (!username) {
      setFieldError(
        usernameInput,
        usernameErr,
        "A felhasználónév megadása kötelező.",
      );
      hasError = true;
    }
    if (!email) {
      setFieldError(emailInput, emailErr, "Az e-mail cím megadása kötelező.");
      hasError = true;
    } else if (!EMAIL_RE.test(email)) {
      setFieldError(emailInput, emailErr, "Adj meg egy érvényes e-mail címet.");
      hasError = true;
    }
    if (!password) {
      setFieldError(passwordInput, passwordErr, "A jelszó megadása kötelező.");
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(
        passwordInput,
        passwordErr,
        "A jelszónak legalább 6 karakterből kell állnia.",
      );
      hasError = true;
    }
    if (!confirmPassword) {
      setFieldError(
        confirmInput,
        confirmErr,
        "A jelszó megerősítése kötelező.",
      );
      hasError = true;
    } else if (password && confirmPassword !== password) {
      setFieldError(confirmInput, confirmErr, "A két jelszó nem egyezik.");
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Regisztráció...";

    try {
      const res = await globalThis.fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        navigate("/login");
        return;
      }

      const msg =
        data?.error ||
        (res.status === 409
          ? "Ez a felhasználónév vagy e-mail már foglalt."
          : res.status === 400
            ? "Hiányzó adatok. Töltsd ki az összes mezőt."
            : "Sikertelen regisztráció.");
      showFormError(errorBox, msg);
    } catch (err) {
      console.error(err);
      showFormError(
        errorBox,
        "Nem sikerült elérni a szervert. Próbáld újra később.",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Regisztráció";
    }
  });
}
