const userNameElement = document.getElementById("userName");
const userRoleElement = document.getElementById("userRole");
const welcomeNameElement = document.getElementById("welcomeName");
const dashboardDescriptionElement = document.getElementById(
  "dashboardDescription",
);

const dashboardContent = document.getElementById("dashboardContent");

const logoutButton = document.getElementById("logoutButton");

// ============================================================
// MAIN DASHBOARD LOADING
// ============================================================

async function loadDashboard() {
  console.log("Loading EchoBank dashboard...");

  // 1. Check authentication

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.log("No authenticated user.");

    window.location.href = "../index.html";

    return;
  }

  console.log("Authenticated user:", user);

  // 2. Retrieve profile + role

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("full_name, email, role_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile retrieval error:", profileError);

    dashboardContent.innerHTML = `
      <div class="error-state">
        <h2>Unable to load your profile</h2>
        <p>
          Your account was authenticated, but your
          EchoBank staff profile could not be loaded.
        </p>
      </div>
    `;

    return;
  }

  console.log("Profile:", profile);

  // 3. Extract profile information

  const fullName = profile.full_name || "Staff Member";

  let roleName = "staff";
  let roleDescription = "General EchoBank staff member";

  if (profile.role_id) {
    const { data: role, error: roleError } = await supabaseClient
      .from("roles")
      .select("name, description")
      .eq("id", profile.role_id)
      .single();

    if (roleError) {
      console.error("Role retrieval error:", roleError);
    } else if (role) {
      roleName = role.name;
      roleDescription = role.description || "EchoBank staff member";
    }
  }

  console.log("User name:", fullName);
  console.log("User role:", roleName);

  // 4. Display basic information

  userNameElement.textContent = fullName;

  userRoleElement.textContent = formatRoleName(roleName);

  welcomeNameElement.textContent = getFirstName(fullName);

  dashboardDescriptionElement.textContent = roleDescription;

  // 5. Render role-specific dashboard

  renderDashboard(roleName);
}

// ============================================================
// GENERAL HELPERS
// ============================================================

function formatRoleName(role) {
  return role
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFirstName(fullName) {
  return fullName.trim().split(" ")[0];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAttemptTime(timestamp) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Date(timestamp).toLocaleString();
}

// ============================================================
// ROLE-BASED DASHBOARD ROUTING
// ============================================================

function renderDashboard(role) {
  switch (role) {
    case "staff":
      renderStaffDashboard();
      break;

    case "teller":
      renderTellerDashboard();
      break;

    case "operations":
      renderOperationsDashboard();
      break;

    case "manager":
      renderManagerDashboard();
      break;

    case "security_admin":
      renderSecurityDashboard();
      break;

    default:
      renderStaffDashboard();
      break;
  }
}

// ============================================================
// STAFF DASHBOARD
// ============================================================

function renderStaffDashboard() {
  dashboardContent.innerHTML = `

    <div class="dashboard-grid">

      <div class="dashboard-card">
        <h3>My Profile</h3>
        <p>
          View your EchoBank staff information.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Internal Messages</h3>
        <p>
          Access internal staff communication.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Notifications</h3>
        <p>
          View important EchoBank notifications.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Staff Tools</h3>
        <p>
          Access tools available to your role.
        </p>
      </div>

    </div>

  `;
}

// ============================================================
// TELLER DASHBOARD
// ============================================================

function renderTellerDashboard() {
  dashboardContent.innerHTML = `

    <div class="dashboard-grid">

      <div class="dashboard-card">
        <h3>Teller Overview</h3>
        <p>
          View today's teller activity.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Transactions</h3>
        <p>
          Access authorized teller operations.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Internal Messages</h3>
        <p>
          Communicate with EchoBank staff.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Notifications</h3>
        <p>
          View operational notifications.
        </p>
      </div>

    </div>

  `;
}

// ============================================================
// OPERATIONS DASHBOARD
// ============================================================

function renderOperationsDashboard() {
  dashboardContent.innerHTML = `

    <div class="dashboard-grid">

      <div class="dashboard-card">
        <h3>Operations Overview</h3>
        <p>
          Monitor operational activity.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Operations Tools</h3>
        <p>
          Access authorized operations functions.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Internal Messages</h3>
        <p>
          Communicate with staff and management.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Notifications</h3>
        <p>
          Review operational alerts.
        </p>
      </div>

    </div>

  `;
}

// ============================================================
// MANAGER DASHBOARD
// ============================================================

function renderManagerDashboard() {
  dashboardContent.innerHTML = `

    <div class="dashboard-grid">

      <div class="dashboard-card">
        <h3>Branch Overview</h3>
        <p>
          View branch-level activity and information.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Staff Management</h3>
        <p>
          Review authorized staff information.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Activity</h3>
        <p>
          Review relevant branch activity.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>Messages</h3>
        <p>
          Communicate with your branch staff.
        </p>
      </div>

    </div>

  `;
}

// ============================================================
// SECURITY ADMIN DASHBOARD
// ============================================================

function renderSecurityDashboard() {
  dashboardContent.innerHTML = `

    <div class="security-dashboard">

      <div class="security-header">

        <div>

          <p class="eyebrow">
            SECURITY OPERATIONS
          </p>

          <h2>
            Security Center
          </h2>

          <p>
            Monitor authentication activity and
            investigate suspicious login patterns.
          </p>

        </div>

        <div class="security-status">

          <span class="status-dot"></span>

          Monitoring Active

        </div>

      </div>


      <!-- Security metrics -->

      <div class="security-metrics">

        <div class="security-metric-card">

          <span>
            Failed Attempts
          </span>

          <strong id="failedAttemptsCount">
            —
          </strong>

          <small>
            Last 10 minutes
          </small>

        </div>


        <div class="security-metric-card">

          <span>
            Open Alerts
          </span>

          <strong id="openAlertsCount">
            —
          </strong>

          <small>
            Requires attention
          </small>

        </div>


        <div class="security-metric-card">

          <span>
            Successful Logins
          </span>

          <strong id="successfulLoginsCount">
            —
          </strong>

          <small>
            Last 10 minutes
          </small>

        </div>


        <div class="security-metric-card">

          <span>
            Total Attempts
          </span>

          <strong id="totalAttemptsCount">
            —
          </strong>

          <small>
            Last 10 minutes
          </small>

        </div>

      </div>


      <!-- Active security alerts -->

      <div class="security-section">

        <div class="section-heading">

          <div>

            <h3>
              Active Security Alerts
            </h3>

            <p>
              Suspicious authentication activity
              detected by EchoBank.
            </p>

          </div>

        </div>


        <div id="securityAlerts">

          <div class="security-loading">
            Loading alerts...
          </div>

        </div>

      </div>


      <!-- Recent login attempts -->

      <div class="security-section">

        <div class="section-heading">

          <div>

            <h3>
              Recent Authentication Activity
            </h3>

            <p>
              Latest login attempts recorded by EchoBank.
            </p>

          </div>

        </div>


        <div id="loginAttempts">

          <div class="security-loading">
            Loading authentication activity...
          </div>

        </div>

      </div>

    </div>

  `;

  // Start loading security information.

  loadSecurityData();

  // Start realtime monitoring.

  subscribeToSecurityEvents();
}

// ============================================================
// SECURITY DATA LOADER
// ============================================================

async function loadSecurityData() {
  console.log("Loading security center data...");

  // Load each component independently.

  // This prevents one failed Supabase request
  // from stopping the entire Security Center.

  try {
    console.log("1. Loading security metrics...");

    await loadSecurityMetrics();

    console.log("✓ Security metrics loaded");
  } catch (error) {
    console.error("Security metrics crashed:", error);
  }

  try {
    console.log("2. Loading security alerts...");

    await loadSecurityAlerts();

    console.log("✓ Security alerts loaded");
  } catch (error) {
    console.error("Security alerts crashed:", error);

    const container = document.getElementById("securityAlerts");

    if (container) {
      container.innerHTML = `

        <div class="security-error">

          <strong>
            Security alerts could not be loaded.
          </strong>

          <p>
            ${escapeHtml(error.message || "Unknown error")}
          </p>

        </div>

      `;
    }
  }

  try {
    console.log("3. Loading recent login attempts...");

    await loadRecentLoginAttempts();

    console.log("✓ Login attempts loaded");
  } catch (error) {
    console.error("Login attempts crashed:", error);
  }

  console.log("Security center loading complete.");
}
// Get the currently authenticated security administrator
async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw new Error(
      "Authenticated security administrator could not be verified.",
    );
  }

  return user;
}

// View security alert details
async function openAlertDetails(alertId) {
  const { data: securityAlert, error } = await supabaseClient
    .from("security_alerts")
    .select(
      `
      id,
      alert_type,
      severity,
      email,
      description,
      status,
      attempt_count,
      created_at,
      investigated_by,
      investigated_at,
      resolution_notes,
      resolved_at
    `,
    )
    .eq("id", alertId)
    .single();

  if (error || !securityAlert) {
    console.error("Security alert details error:", error);

    window.alert("Unable to load the security alert details.");

    return;
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: attempts, error: attemptsError } = await supabaseClient
    .from("login_attempts")
    .select(
      `
        email,
        successful,
        attempted_at,
        user_agent
      `,
    )
    .eq("email", securityAlert.email)
    .eq("successful", false)
    .gte("attempted_at", tenMinutesAgo)
    .order("attempted_at", {
      ascending: false,
    })
    .limit(25);

  if (attemptsError) {
    console.error("Alert activity error:", attemptsError);
  }

  const attemptRows =
    attempts && attempts.length
      ? attempts
          .map(
            (attempt) => `
              <div class="incident-attempt">

                <div>
                  <strong>Failed login</strong>

                  <small>
                    ${formatAttemptTime(attempt.attempted_at)}
                  </small>
                </div>

                <span>
                  ${escapeHtml(attempt.user_agent || "Unknown device")}
                </span>

              </div>
            `,
          )
          .join("")
      : `
          <p>
            No recent failed attempts were found
            for this alert.
          </p>
        `;

  const existingModal = document.getElementById("securityIncidentModal");

  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="security-modal"
        id="securityIncidentModal"
      >

        <div
          class="security-modal-backdrop"
          onclick="closeSecurityModal()"
        ></div>

        <div class="security-modal-card">

          <div class="security-modal-header">

            <div>

              <p class="eyebrow">
                SECURITY INCIDENT
              </p>

              <h2>
                ${escapeHtml(securityAlert.alert_type)}
              </h2>

            </div>

            <button
              class="modal-close"
              onclick="closeSecurityModal()"
            >
              &times;
            </button>

          </div>


          <div class="incident-summary">

            <div>
              <span>Status</span>
              <strong>
                ${escapeHtml(securityAlert.status)}
              </strong>
            </div>

            <div>
              <span>Severity</span>

              <strong
                class="incident-severity ${escapeHtml(securityAlert.severity)}"
              >
                ${escapeHtml(securityAlert.severity)}
              </strong>
            </div>

            <div>
              <span>Attempts</span>
              <strong>
                ${securityAlert.attempt_count || 0}
              </strong>
            </div>

            <div>
              <span>Target</span>
              <strong>
                ${escapeHtml(securityAlert.email || "Unknown")}
              </strong>
            </div>

          </div>


          <div class="incident-description">

            <h3>Incident Description</h3>

            <p>
              ${escapeHtml(securityAlert.description)}
            </p>

          </div>


          <div class="incident-activity">

            <h3>
              Recent Failed Attempts
            </h3>

            ${attemptRows}

          </div>


          ${
            securityAlert.resolution_notes
              ? `
                <div class="incident-notes">

                  <h3>
                    Resolution Notes
                  </h3>

                  <p>
                    ${escapeHtml(securityAlert.resolution_notes)}
                  </p>

                </div>
              `
              : ""
          }

        </div>

      </div>
    `,
  );
}

// Close investigation/resolution modal
function closeSecurityModal() {
  const modal = document.getElementById("securityIncidentModal");

  const resolutionModal = document.getElementById("securityResolutionModal");

  if (modal) {
    modal.remove();
  }

  if (resolutionModal) {
    resolutionModal.remove();
  }
}

// Mark an alert as being investigated
async function investigateAlert(alertId) {
  try {
    const user = await getCurrentUser();

    const { error } = await supabaseClient
      .from("security_alerts")
      .update({
        status: "investigating",
        investigated_by: user.id,
        investigated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .eq("status", "open");

    if (error) {
      console.error("Investigate alert error:", error);

      window.alert("Unable to mark this alert as investigating.");

      return;
    }

    showSecurityNotification("Security alert marked as investigating");

    await loadSecurityMetrics();
    await loadSecurityAlerts();
  } catch (error) {
    console.error("Investigation error:", error);

    window.alert(error.message || "Unable to investigate this alert.");
  }
}

// Open the resolution form
function openResolveDialog(alertId) {
  const existingModal = document.getElementById("securityResolutionModal");

  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="security-modal"
        id="securityResolutionModal"
      >

        <div
          class="security-modal-backdrop"
          onclick="closeSecurityModal()"
        ></div>

        <div class="security-modal-card">

          <div class="security-modal-header">

            <div>

              <p class="eyebrow">
                INCIDENT RESOLUTION
              </p>

              <h2>
                Resolve Security Alert
              </h2>

            </div>

            <button
              class="modal-close"
              onclick="closeSecurityModal()"
            >
              &times;
            </button>

          </div>


          <div class="resolution-form">

            <label for="resolutionNotes">
              Resolution notes
            </label>

            <textarea
              id="resolutionNotes"
              placeholder="Record what was investigated, what was found, and how the incident was resolved..."
            ></textarea>


            <div class="resolution-actions">

              <button
                class="cancel-button"
                onclick="closeSecurityModal()"
              >
                Cancel
              </button>

              <button
                class="resolve-button"
                onclick="resolveAlert(${alertId})"
              >
                Resolve Alert
              </button>

            </div>

          </div>

        </div>

      </div>
    `,
  );
}

// Resolve the security alert
async function resolveAlert(alertId) {
  const notesElement = document.getElementById("resolutionNotes");

  const resolutionNotes = notesElement ? notesElement.value.trim() : "";

  if (!resolutionNotes) {
    window.alert("Please enter resolution notes before resolving this alert.");

    return;
  }

  try {
    const user = await getCurrentUser();

    const { error } = await supabaseClient
      .from("security_alerts")
      .update({
        status: "resolved",

        resolution_notes: resolutionNotes,

        resolved_at: new Date().toISOString(),

        investigated_by: user.id,

        investigated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .in("status", ["open", "investigating"]);

    if (error) {
      console.error("Resolve alert error:", error);

      window.alert("Unable to resolve this alert.");

      return;
    }

    closeSecurityModal();

    showSecurityNotification("Security alert resolved successfully");

    await loadSecurityMetrics();
    await loadSecurityAlerts();
  } catch (error) {
    console.error("Resolution error:", error);

    window.alert(error.message || "Unable to resolve this alert.");
  }
}
// ============================================================
// SECURITY METRICS
// ============================================================

async function loadSecurityMetrics() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data, error } = await supabaseClient

    .from("login_attempts")

    .select("successful")

    .gte("attempted_at", tenMinutesAgo);

  if (error) {
    console.error("Security metrics error:", error);

    return;
  }

  const attempts = data || [];

  const totalAttempts = attempts.length;

  const failedAttempts = attempts.filter(
    (attempt) => !attempt.successful,
  ).length;

  const successfulLogins = attempts.filter(
    (attempt) => attempt.successful,
  ).length;

  const totalElement = document.getElementById("totalAttemptsCount");

  const failedElement = document.getElementById("failedAttemptsCount");

  const successfulElement = document.getElementById("successfulLoginsCount");

  if (totalElement) {
    totalElement.textContent = totalAttempts;
  }

  if (failedElement) {
    failedElement.textContent = failedAttempts;
  }

  if (successfulElement) {
    successfulElement.textContent = successfulLogins;
  }

  // ----------------------------------------------------------
  // Open security alerts
  // ----------------------------------------------------------

  const { count, error: alertError } = await supabaseClient

    .from("security_alerts")

    .select("*", {
      count: "exact",
      head: true,
    })

    .in("status", ["open", "investigating"]);

  if (alertError) {
    console.error("Alert count error:", alertError);

    return;
  }

  const openAlertsElement = document.getElementById("openAlertsCount");

  if (openAlertsElement) {
    openAlertsElement.textContent = count || 0;
  }
}

// ============================================================
// LOAD SECURITY ALERTS
// ============================================================

// load security alerts
async function loadSecurityAlerts() {
  const alertsContainer = document.getElementById("securityAlerts");

  const { data: alerts, error } = await supabaseClient
    .from("security_alerts")
    .select(
      `
      id,
      alert_type,
      severity,
      email,
      description,
      status,
      attempt_count,
      created_at,
      investigated_by,
      investigated_at,
      resolution_notes,
      resolved_at
    `,
    )
    .in("status", ["open", "investigating"])
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    console.error("Security alerts database error:", error);

    alertsContainer.innerHTML = `
      <div class="security-error">
        <strong>Unable to load security alerts.</strong>
        <p>${escapeHtml(error.message || "Database error")}</p>
      </div>
    `;

    return;
  }

  if (!alerts || alerts.length === 0) {
    alertsContainer.innerHTML = `
      <div class="empty-security-state">
        <strong>No active security alerts</strong>
        <p>
          EchoBank has not detected any unresolved
          security events.
        </p>
      </div>
    `;

    return;
  }

  alertsContainer.innerHTML = alerts
    .map(
      (securityAlert) => `
        <div class="security-alert">

          <div class="alert-indicator"></div>

          <div class="alert-content">

            <div class="alert-top">

              <strong>
                ${escapeHtml(securityAlert.alert_type)}
              </strong>

              <span class="severity ${escapeHtml(securityAlert.severity)}">
                ${escapeHtml(securityAlert.severity)}
              </span>

            </div>

            <p>
              ${escapeHtml(securityAlert.description)}
            </p>

            <small>
              Target:
              ${escapeHtml(securityAlert.email || "Unknown")}
              ·
              ${securityAlert.attempt_count || 0}
              failed attempts
              ·
              Status:
              ${escapeHtml(securityAlert.status)}
            </small>

            <div class="alert-actions">

              <button
                class="details-button"
                onclick="openAlertDetails(${securityAlert.id})"
              >
                View Details
              </button>

              ${
                securityAlert.status === "open"
                  ? `
                    <button
                      class="investigate-button"
                      onclick="investigateAlert(${securityAlert.id})"
                    >
                      Investigate
                    </button>
                  `
                  : ""
              }

              <button
                class="resolve-button"
                onclick="openResolveDialog(${securityAlert.id})"
              >
                Resolve
              </button>

            </div>

          </div>

        </div>
      `,
    )
    .join("");
}

// Get the currently authenticated security administrator
async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw new Error(
      "Authenticated security administrator could not be verified.",
    );
  }

  return user;
}

// View security alert details
async function openAlertDetails(alertId) {
  const { data: securityAlert, error } = await supabaseClient
    .from("security_alerts")
    .select(
      `
      id,
      alert_type,
      severity,
      email,
      description,
      status,
      attempt_count,
      created_at,
      investigated_by,
      investigated_at,
      resolution_notes,
      resolved_at
    `,
    )
    .eq("id", alertId)
    .single();

  if (error || !securityAlert) {
    console.error("Security alert details error:", error);

    window.alert("Unable to load the security alert details.");

    return;
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: attempts, error: attemptsError } = await supabaseClient
    .from("login_attempts")
    .select(
      `
        email,
        successful,
        attempted_at,
        user_agent
      `,
    )
    .eq("email", securityAlert.email)
    .eq("successful", false)
    .gte("attempted_at", tenMinutesAgo)
    .order("attempted_at", {
      ascending: false,
    })
    .limit(25);

  if (attemptsError) {
    console.error("Alert activity error:", attemptsError);
  }

  const attemptRows =
    attempts && attempts.length
      ? attempts
          .map(
            (attempt) => `
              <div class="incident-attempt">

                <div>
                  <strong>Failed login</strong>

                  <small>
                    ${formatAttemptTime(attempt.attempted_at)}
                  </small>
                </div>

                <span>
                  ${escapeHtml(attempt.user_agent || "Unknown device")}
                </span>

              </div>
            `,
          )
          .join("")
      : `
          <p>
            No recent failed attempts were found
            for this alert.
          </p>
        `;

  const existingModal = document.getElementById("securityIncidentModal");

  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="security-modal"
        id="securityIncidentModal"
      >

        <div
          class="security-modal-backdrop"
          onclick="closeSecurityModal()"
        ></div>

        <div class="security-modal-card">

          <div class="security-modal-header">

            <div>

              <p class="eyebrow">
                SECURITY INCIDENT
              </p>

              <h2>
                ${escapeHtml(securityAlert.alert_type)}
              </h2>

            </div>

            <button
              class="modal-close"
              onclick="closeSecurityModal()"
            >
              &times;
            </button>

          </div>


          <div class="incident-summary">

            <div>
              <span>Status</span>
              <strong>
                ${escapeHtml(securityAlert.status)}
              </strong>
            </div>

            <div>
              <span>Severity</span>

              <strong
                class="incident-severity ${escapeHtml(securityAlert.severity)}"
              >
                ${escapeHtml(securityAlert.severity)}
              </strong>
            </div>

            <div>
              <span>Attempts</span>
              <strong>
                ${securityAlert.attempt_count || 0}
              </strong>
            </div>

            <div>
              <span>Target</span>
              <strong>
                ${escapeHtml(securityAlert.email || "Unknown")}
              </strong>
            </div>

          </div>


          <div class="incident-description">

            <h3>Incident Description</h3>

            <p>
              ${escapeHtml(securityAlert.description)}
            </p>

          </div>


          <div class="incident-activity">

            <h3>
              Recent Failed Attempts
            </h3>

            ${attemptRows}

          </div>


          ${
            securityAlert.resolution_notes
              ? `
                <div class="incident-notes">

                  <h3>
                    Resolution Notes
                  </h3>

                  <p>
                    ${escapeHtml(securityAlert.resolution_notes)}
                  </p>

                </div>
              `
              : ""
          }

        </div>

      </div>
    `,
  );
}

// Close investigation/resolution modal
function closeSecurityModal() {
  const modal = document.getElementById("securityIncidentModal");

  const resolutionModal = document.getElementById("securityResolutionModal");

  if (modal) {
    modal.remove();
  }

  if (resolutionModal) {
    resolutionModal.remove();
  }
}

// Mark an alert as being investigated
async function investigateAlert(alertId) {
  try {
    const user = await getCurrentUser();

    const { error } = await supabaseClient
      .from("security_alerts")
      .update({
        status: "investigating",
        investigated_by: user.id,
        investigated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .eq("status", "open");

    if (error) {
      console.error("Investigate alert error:", error);

      window.alert("Unable to mark this alert as investigating.");

      return;
    }

    showSecurityNotification("Security alert marked as investigating");

    await loadSecurityMetrics();
    await loadSecurityAlerts();
  } catch (error) {
    console.error("Investigation error:", error);

    window.alert(error.message || "Unable to investigate this alert.");
  }
}

// Open the resolution form
function openResolveDialog(alertId) {
  const existingModal = document.getElementById("securityResolutionModal");

  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="security-modal"
        id="securityResolutionModal"
      >

        <div
          class="security-modal-backdrop"
          onclick="closeSecurityModal()"
        ></div>

        <div class="security-modal-card">

          <div class="security-modal-header">

            <div>

              <p class="eyebrow">
                INCIDENT RESOLUTION
              </p>

              <h2>
                Resolve Security Alert
              </h2>

            </div>

            <button
              class="modal-close"
              onclick="closeSecurityModal()"
            >
              &times;
            </button>

          </div>


          <div class="resolution-form">

            <label for="resolutionNotes">
              Resolution notes
            </label>

            <textarea
              id="resolutionNotes"
              placeholder="Record what was investigated, what was found, and how the incident was resolved..."
            ></textarea>


            <div class="resolution-actions">

              <button
                class="cancel-button"
                onclick="closeSecurityModal()"
              >
                Cancel
              </button>

              <button
                class="resolve-button"
                onclick="resolveAlert(${alertId})"
              >
                Resolve Alert
              </button>

            </div>

          </div>

        </div>

      </div>
    `,
  );
}

// Resolve the security alert
async function resolveAlert(alertId) {
  const notesElement = document.getElementById("resolutionNotes");

  const resolutionNotes = notesElement ? notesElement.value.trim() : "";

  if (!resolutionNotes) {
    window.alert("Please enter resolution notes before resolving this alert.");

    return;
  }

  try {
    const user = await getCurrentUser();

    const { error } = await supabaseClient
      .from("security_alerts")
      .update({
        status: "resolved",

        resolution_notes: resolutionNotes,

        resolved_at: new Date().toISOString(),

        investigated_by: user.id,

        investigated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .in("status", ["open", "investigating"]);

    if (error) {
      console.error("Resolve alert error:", error);

      window.alert("Unable to resolve this alert.");

      return;
    }

    closeSecurityModal();

    showSecurityNotification("Security alert resolved successfully");

    await loadSecurityMetrics();
    await loadSecurityAlerts();
  } catch (error) {
    console.error("Resolution error:", error);

    window.alert(error.message || "Unable to resolve this alert.");
  }
}

// ============================================================
// ALERT DETAILS
// ============================================================

async function openAlertDetails(alertId) {
  console.log("Opening security alert:", alertId);

  const { data: securityAlert, error } = await supabaseClient

    .from("security_alerts")

    .select(
      `
      id,
      alert_type,
      severity,
      email,
      description,
      status,
      attempt_count,
      created_at,
      investigated_by,
      investigated_at,
      resolution_notes,
      resolved_at
    `,
    )

    .eq("id", alertId)

    .single();

  if (error || !securityAlert) {
    console.error("Unable to load alert details:", error);

    window.alert("Unable to load security alert details.");

    return;
  }

  // Find failed attempts associated
  // with this account.

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: attempts, error: attemptsError } = await supabaseClient

    .from("login_attempts")

    .select(
      `
      id,
      email,
      successful,
      attempted_at,
      user_agent
    `,
    )

    .eq("email", securityAlert.email)

    .eq("successful", false)

    .gte("attempted_at", tenMinutesAgo)

    .order("attempted_at", {
      ascending: false,
    })

    .limit(50);

  if (attemptsError) {
    console.error("Unable to load related attempts:", attemptsError);
  }

  const attemptList = attempts || [];

  let attemptsHtml;

  if (attemptList.length > 0) {
    attemptsHtml = attemptList

      .map(
        (attempt) => `

            <div class="incident-attempt">

              <div>

                <strong>
                  Failed login
                </strong>

                <small>
                  ${new Date(attempt.attempted_at).toLocaleString()}
                </small>

              </div>


              <span>
                ${escapeHtml(attempt.user_agent || "Unknown user agent")}
              </span>

            </div>

          `,
      )

      .join("");
  } else {
    attemptsHtml = `

      <p>
        No recent failed attempts were
        found for this account.
      </p>

    `;
  }

  const modal = document.createElement("div");

  modal.id = "security-alert-modal";

  modal.className = "security-modal";

  modal.innerHTML = `

    <div
      class="security-modal-backdrop"
      onclick="closeSecurityModal()"
    ></div>


    <div class="security-modal-card">


      <div class="security-modal-header">

        <div>

          <small>
            SECURITY INCIDENT
          </small>

          <h2>
            ${escapeHtml(
              (securityAlert.alert_type || "Security Alert").replace(/_/g, " "),
            )}
          </h2>

        </div>


        <button
          class="modal-close"
          onclick="closeSecurityModal()"
        >
          &times;
        </button>

      </div>


      <div class="incident-summary">


        <div>

          <span>
            Account
          </span>

          <strong>
            ${escapeHtml(securityAlert.email || "Unknown")}
          </strong>

        </div>


        <div>

          <span>
            Severity
          </span>

          <strong
            class="incident-severity ${escapeHtml(
              securityAlert.severity || "medium",
            )}"
          >
            ${escapeHtml(securityAlert.severity || "medium")}
          </strong>

        </div>


        <div>

          <span>
            Status
          </span>

          <strong>
            ${escapeHtml(securityAlert.status || "open")}
          </strong>

        </div>


        <div>

          <span>
            Failed Attempts
          </span>

          <strong>
            ${securityAlert.attempt_count || 0}
          </strong>

        </div>


      </div>


      <div class="incident-description">

        <h3>
          Incident Description
        </h3>

        <p>
          ${escapeHtml(
            securityAlert.description || "No description available.",
          )}
        </p>

      </div>


      <div class="incident-activity">

        <h3>
          Recent Login Activity
        </h3>

        ${attemptsHtml}

      </div>


      ${
        securityAlert.investigated_at
          ? `

            <div class="incident-notes">

              <h3>
                Investigation
              </h3>

              <p>

                Investigation started:

                ${new Date(securityAlert.investigated_at).toLocaleString()}

              </p>

            </div>

          `
          : ""
      }


      ${
        securityAlert.resolution_notes
          ? `

            <div class="incident-notes">

              <h3>
                Resolution Notes
              </h3>

              <p>
                ${escapeHtml(securityAlert.resolution_notes)}
              </p>

            </div>

          `
          : ""
      }


    </div>

  `;

  document.body.appendChild(modal);
}

function closeSecurityModal() {
  const modal = document.getElementById("security-alert-modal");

  if (modal) {
    modal.remove();
  }
}

// ============================================================
// START INVESTIGATION
// ============================================================

async function investigateAlert(alertId) {
  const confirmed = window.confirm(
    "Start an investigation for this security alert?",
  );

  if (!confirmed) {
    return;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    window.alert("Unable to identify the current security administrator.");

    return;
  }

  console.log("Starting investigation:", alertId);

  const { error } = await supabaseClient

    .from("security_alerts")

    .update({
      status: "investigating",

      investigated_by: user.id,

      investigated_at: new Date().toISOString(),
    })

    .eq("id", alertId);

  if (error) {
    console.error("Unable to start investigation:", error);

    window.alert("Unable to start the investigation. Please try again.");

    return;
  }

  await loadSecurityAlerts();

  await loadSecurityMetrics();

  showSecurityNotification("Security alert moved to investigation");
}

// ============================================================
// RESOLUTION DIALOG
// ============================================================

function openResolveDialog(alertId) {
  const existingModal = document.getElementById("security-resolution-modal");

  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");

  modal.id = "security-resolution-modal";

  modal.className = "security-modal";

  modal.innerHTML = `

    <div
      class="security-modal-backdrop"
      onclick="closeResolveDialog()"
    ></div>


    <div class="security-modal-card">


      <div class="security-modal-header">

        <div>

          <small>
            SECURITY INCIDENT
          </small>

          <h2>
            Resolve Alert
          </h2>

        </div>


        <button
          class="modal-close"
          onclick="closeResolveDialog()"
        >
          &times;
        </button>

      </div>


      <div class="resolution-form">


        <label
          for="resolution-notes"
        >
          Resolution Notes
        </label>


        <textarea
          id="resolution-notes"
          placeholder="Describe what was investigated, what was found, and how the incident was resolved..."
        ></textarea>


        <div class="resolution-actions">


          <button
            class="cancel-button"
            onclick="closeResolveDialog()"
          >
            Cancel
          </button>


          <button
            class="resolve-button"
            onclick="resolveAlert(${alertId})"
          >
            Mark as Resolved
          </button>


        </div>


      </div>


    </div>

  `;

  document.body.appendChild(modal);
}

function closeResolveDialog() {
  const modal = document.getElementById("security-resolution-modal");

  if (modal) {
    modal.remove();
  }
}

// ============================================================
// RESOLVE ALERT
// ============================================================

async function resolveAlert(alertId) {
  const notesElement = document.getElementById("resolution-notes");

  if (!notesElement) {
    return;
  }

  const resolutionNotes = notesElement.value.trim();

  if (!resolutionNotes) {
    window.alert("Please enter resolution notes before closing the alert.");

    return;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    window.alert("Unable to identify the current security administrator.");

    return;
  }

  console.log("Resolving security alert:", alertId);

  const { error } = await supabaseClient

    .from("security_alerts")

    .update({
      status: "resolved",

      investigated_by: user.id,

      investigated_at: new Date().toISOString(),

      resolution_notes: resolutionNotes,

      resolved_at: new Date().toISOString(),
    })

    .eq("id", alertId);

  if (error) {
    console.error("Unable to resolve alert:", error);

    window.alert("Unable to resolve the alert. Please try again.");

    return;
  }

  closeResolveDialog();

  await loadSecurityAlerts();

  await loadSecurityMetrics();

  showSecurityNotification("Security alert marked as resolved");
}

// ============================================================
// RECENT LOGIN ATTEMPTS
// ============================================================

async function loadRecentLoginAttempts() {
  const container = document.getElementById("loginAttempts");

  if (!container) {
    console.error("loginAttempts container was not found.");

    return;
  }

  const { data: attempts, error } = await supabaseClient

    .from("login_attempts")

    .select(
      `
        email,
        successful,
        attempted_at,
        user_agent
      `,
    )

    .order("attempted_at", {
      ascending: false,
    })

    .limit(15);

  if (error) {
    console.error("Login attempts error:", error);

    container.innerHTML = `

      <div class="security-error">

        <strong>
          Unable to load authentication activity.
        </strong>

        <p>
          ${escapeHtml(error.message || "Unknown error")}
        </p>

      </div>

    `;

    return;
  }

  if (!attempts || attempts.length === 0) {
    container.innerHTML = `

      <div class="empty-security-state">

        No authentication activity recorded.

      </div>

    `;

    return;
  }

  container.innerHTML = `

    <div class="attempt-table">


      <div
        class="attempt-row attempt-header"
      >

        <span>
          Email
        </span>

        <span>
          Status
        </span>

        <span>
          Time
        </span>

      </div>


      ${attempts
        .map(
          (attempt) => `

            <div class="attempt-row">


              <span>
                ${escapeHtml(attempt.email)}
              </span>


              <span
                class="${attempt.successful ? "login-success" : "login-failed"}"
              >

                ${attempt.successful ? "Successful" : "Failed"}

              </span>


              <span>

                ${formatAttemptTime(attempt.attempted_at)}

              </span>


            </div>

          `,
        )
        .join("")}


    </div>

  `;
}

// ============================================================
// LOGOUT
// ============================================================

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error);

      return;
    }

    window.location.href = "../index.html";
  });
}

// ============================================================
// REALTIME SECURITY MONITORING
// ============================================================

let securityRealtimeChannel = null;

function subscribeToSecurityEvents() {
  // Remove any existing channel.

  if (securityRealtimeChannel) {
    supabaseClient.removeChannel(securityRealtimeChannel);

    securityRealtimeChannel = null;
  }

  console.log("Starting security realtime monitoring...");

  securityRealtimeChannel = supabaseClient

    .channel("security-monitoring")

    // ------------------------------------------------------
    // Security alerts
    // ------------------------------------------------------

    .on(
      "postgres_changes",

      {
        event: "*",

        schema: "public",

        table: "security_alerts",
      },

      async (payload) => {
        console.log("Security alert change:", payload.eventType, payload.new);

        await loadSecurityMetrics();

        await loadSecurityAlerts();

        if (payload.eventType === "INSERT") {
          showSecurityNotification("New security alert detected");
        }

        if (payload.eventType === "UPDATE") {
          showSecurityNotification("Security alert status updated");
        }
      },
    )

    // ------------------------------------------------------
    // Login attempts
    // ------------------------------------------------------

    .on(
      "postgres_changes",

      {
        event: "INSERT",

        schema: "public",

        table: "login_attempts",
      },

      async (payload) => {
        console.log("New login attempt:", payload.new);

        await loadSecurityMetrics();

        await loadRecentLoginAttempts();
      },
    )

    .subscribe((status) => {
      console.log("Security realtime status:", status);
    });
}

// ============================================================
// SECURITY NOTIFICATION
// ============================================================

function showSecurityNotification(message) {
  const notification = document.createElement("div");

  notification.className = "security-toast";

  notification.innerHTML = `

    <div
      class="security-toast-dot"
    ></div>


    <div>

      <strong>
        Security Alert
      </strong>

      <p>
        ${escapeHtml(message)}
      </p>

    </div>

  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// ============================================================
// START DASHBOARD
// ============================================================

loadDashboard();
