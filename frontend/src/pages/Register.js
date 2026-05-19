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
        <label for="username">Username</label>
        <input id="username" name="username" type="text" placeholder="e.g. lucky_player" autocomplete="username" required />
        <span class="field-error" id="usernameError"></span>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required />
        <span class="field-error" id="emailError"></span>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" placeholder="at least 6 characters" autocomplete="new-password" required minlength="6" />
        <span class="field-error" id="passwordError"></span>
      </div>

      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autocomplete="new-password" required />
        <span class="field-error" id="confirmPasswordError"></span>
      </div>

      <button class="btn-submit" type="submit" id="submitBtn">Register</button>
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
      setFieldError(usernameInput, usernameErr, "Username is required.");
      hasError = true;
    }
    if (!email) {
      setFieldError(emailInput, emailErr, "Email address is required.");
      hasError = true;
    } else if (!EMAIL_RE.test(email)) {
      setFieldError(emailInput, emailErr, "Please enter a valid email address.");
      hasError = true;
    }
    if (!password) {
      setFieldError(passwordInput, passwordErr, "Password is required.");
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(passwordInput, passwordErr, "Password must be at least 6 characters.");
      hasError = true;
    }
    if (!confirmPassword) {
      setFieldError(confirmInput, confirmErr, "Please confirm your password.");
      hasError = true;
    } else if (password && confirmPassword !== password) {
      setFieldError(confirmInput, confirmErr, "Passwords do not match.");
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

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
          ? "That username or email is already taken."
          : res.status === 400
            ? "Missing fields. Please fill in all fields."
            : "Registration failed.");
      showFormError(errorBox, msg);
    } catch (err) {
      console.error(err);
      showFormError(errorBox, "Could not reach the server. Please try again later.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
    }
  });
}
