import "./Login.css";
import {
  renderAuthShell,
  showFormError,
  clearFormError,
} from "../components/auth/authShell.js";

const API_URL = import.meta.env.VITE_API_URL || "";

export function setupLogin(element, options = {}) {
  const navigate =
    options.navigate || ((path) => (window.location.hash = "#" + path));

  const { formSlot, errorBox } = renderAuthShell(element, {
    mode: "login",
    navigate,
    onBack: options.onBack,
  });

  formSlot.innerHTML = `
    <form class="auth-form" id="loginForm" novalidate>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" placeholder="e.g. lucky_player" autocomplete="username" required />
        <span class="field-error" id="usernameError"></span>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required minlength="6" />
        <span class="field-error" id="passwordError"></span>
      </div>

      <button class="btn-submit" type="submit" id="submitBtn">Login</button>
    </form>
  `;

  const form = formSlot.querySelector("#loginForm");
  const usernameInput = formSlot.querySelector("#username");
  const passwordInput = formSlot.querySelector("#password");
  const usernameErr = formSlot.querySelector("#usernameError");
  const passwordErr = formSlot.querySelector("#passwordError");
  const submitBtn = formSlot.querySelector("#submitBtn");

  function resetErrors() {
    clearFormError(errorBox);
    [usernameInput, passwordInput].forEach((el) =>
      el.classList.remove("invalid"),
    );
    [usernameErr, passwordErr].forEach((el) => (el.textContent = ""));
  }

  function setFieldError(input, span, msg) {
    input.classList.add("invalid");
    span.textContent = msg;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;
    if (!username) {
      setFieldError(usernameInput, usernameErr, "Username is required.");
      hasError = true;
    }
    if (!password) {
      setFieldError(passwordInput, passwordErr, "Password is required.");
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(passwordInput, passwordErr, "Password must be at least 6 characters.");
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const res = await globalThis.fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        navigate("/");
        return;
      }

      const msg =
        data?.error ||
        (res.status === 401
          ? "Invalid username or password."
          : "Login failed.");
      showFormError(errorBox, msg);
    } catch (err) {
      console.error(err);
      showFormError(errorBox, "Could not reach the server. Please try again later.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}
