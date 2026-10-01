// ==============================
// SIGNUP
// ==============================

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

if (signupForm) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    signupMessage.textContent = "";

    // Check that both passwords are the same
    if (password !== confirmPassword) {
      signupMessage.textContent = "Passwords do not match.";
      signupMessage.style.color = "#ef4444";
      return;
    }

    signupMessage.textContent = "Creating your account...";
    signupMessage.style.color = "#8b938e";

    // Create the Supabase account
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,

      // Store extra information with the user
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // If Supabase returns an error
    if (error) {
      console.error(error);

      signupMessage.textContent = error.message;
      signupMessage.style.color = "#ef4444";

      return;
    }

    console.log(data);

    signupMessage.textContent =
      "Account created. Please check your email to verify your account.";

    signupMessage.style.color = "#22c55e";

    signupForm.reset();
  });
}

// ==============================
// LOGIN
// ==============================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    loginMessage.textContent = "Signing in...";
    loginMessage.style.color = "#8b938e";

    console.log("Login attempt for:", email);

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // --------------------------------
    // FAILED LOGIN
    // --------------------------------

    if (error) {
      console.error("Login error:", error);

      await recordLoginAttempt(email, false);

      loginMessage.textContent = "Invalid email or password.";

      loginMessage.style.color = "#ef4444";

      return;
    }

    // --------------------------------
    // SUCCESSFUL LOGIN
    // --------------------------------

    await recordLoginAttempt(email, true);

    console.log("Login successful:", data);

    loginMessage.textContent = "Login successful.";

    loginMessage.style.color = "#22c55e";

    window.location.href = "frontend/dashboard.html";
  });
} else {
  console.log("Login form was not found on this page.");
}

// ==============================
// PASSWORD VISIBILITY
// ==============================

const passwordToggle = document.getElementById("passwordToggle");
const passwordInput = document.getElementById("password");

if (passwordToggle && passwordInput) {
  passwordToggle.addEventListener("click", function () {
    // Check the current input type
    const isPassword = passwordInput.type === "password";

    // Change between password and text
    passwordInput.type = isPassword ? "text" : "password";

    // Update the accessibility label
    passwordToggle.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password",
    );
  });
}

// Addiing the monitoring fuunction
async function recordLoginAttempt(email, successful) {
  try {
    const { error } = await supabaseClient.from("login_attempts").insert({
      email: email.toLowerCase(),
      successful: successful,
      user_agent: navigator.userAgent,
    });

    if (error) {
      console.error("Failed to record login attempt:", error);

      return;
    }

    console.log("Login attempt recorded:", successful);

    // Only check for brute force
    // after a failed attempt.

    if (!successful) {
      const { data: detectionResult, error: detectionError } =
        await supabaseClient.rpc("check_bruteforce_attempt", {
          p_target_email: email.toLowerCase(),
        });

      if (detectionError) {
        console.error("Brute-force detection error:", detectionError);
      } else {
        console.log(
          "Brute-force detection executed successfully:",
          detectionResult,
        );
      }
    }
  } catch (error) {
    console.error("Security monitoring error:", error);
  }
}
