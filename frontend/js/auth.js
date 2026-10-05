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

    try {
      const { data, error } = await supabaseClient.functions.invoke(
        "record-login-attempt",
        {
          body: {
            email: email,
            password: password,
          },
        },
      );

      if (error) {
        console.error("Login security function error:", error);

        loginMessage.textContent = "Unable to process login. Please try again.";

        loginMessage.style.color = "#ef4444";

        return;
      }

      // --------------------------------
      // IP BLOCKED
      // --------------------------------

      if (data?.blocked) {
        loginMessage.textContent =
          "Access temporarily blocked due to suspicious login activity.";

        loginMessage.style.color = "#ef4444";

        console.warn("Login blocked. IP block expires:", data.expires_at);

        return;
      }

      // --------------------------------
      // FAILED LOGIN
      // --------------------------------

      if (!data?.success) {
        loginMessage.textContent = "Invalid email or password.";

        loginMessage.style.color = "#ef4444";

        // Run the existing brute-force detector
        const { error: detectionError } = await supabaseClient.rpc(
          "check_bruteforce_attempt",
          {
            p_target_email: email.toLowerCase(),
            p_ip_address: data?.ip_address || null,
          },
        );

        if (detectionError) {
          console.error("Brute-force detection error:", detectionError);
        }

        return;
      }

      // --------------------------------
      // SUCCESSFUL LOGIN
      // --------------------------------

      if (data.session) {
        const { error: sessionError } = await supabaseClient.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error("Failed to establish session:", sessionError);

          loginMessage.textContent =
            "Login succeeded, but the session could not be established.";

          loginMessage.style.color = "#ef4444";

          return;
        }
      }

      console.log("Login successful:", data);

      loginMessage.textContent = "Login successful.";

      loginMessage.style.color = "#22c55e";

      window.location.href = "frontend/dashboard.html";
    } catch (error) {
      console.error("Login error:", error);

      loginMessage.textContent = "Unable to process login. Please try again.";

      loginMessage.style.color = "#ef4444";
    }
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
// ==============================
// SECURITY MONITORING
// ==============================

async function recordLoginAttempt(email, successful) {
  try {
    // Ask the Edge Function for the request's source IP
    const { data: ipData, error: ipError } =
      await supabaseClient.functions.invoke("record-login-attempt", {
        body: {
          email: email.toLowerCase(),
          successful: successful,
        },
      });

    if (ipError) {
      console.error("Failed to capture IP address:", ipError);
    }

    const ipAddress = ipData?.ip_address || null;

    // Record the login attempt
    const { error } = await supabaseClient.from("login_attempts").insert({
      email: email.toLowerCase(),
      successful: successful,
      user_agent: navigator.userAgent,
      ip_address: ipAddress,
    });

    if (error) {
      console.error("Failed to record login attempt:", error);
      return;
    }

    console.log("Login attempt recorded:", {
      email: email.toLowerCase(),
      successful: successful,
      ip_address: ipAddress,
    });

    // Only check for brute force after a failed attempt
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
