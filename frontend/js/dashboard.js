const userNameElement = document.getElementById("userName");
const userRoleElement = document.getElementById("userRole");
const welcomeNameElement = document.getElementById("welcomeName");
const dashboardDescriptionElement = document.getElementById(
  "dashboardDescription",
);

const dashboardContent = document.getElementById("dashboardContent");

const logoutButton = document.getElementById("logoutButton");

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

function formatRoleName(role) {
  return role
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFirstName(fullName) {
  return fullName.trim().split(" ")[0];
}

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

function renderSecurityDashboard() {
  dashboardContent.innerHTML = `

        <div class="security-dashboard">

            <div class="security-header">
                <div>
                    <p class="eyebrow">SECURITY OPERATIONS</p>
                    <h2>Security Center</h2>
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
                    <span>Failed Attempts</span>
                    <strong id="failedAttemptsCount">—</strong>
                    <small>Last 10 minutes</small>
                </div>

                <div class="security-metric-card">
                    <span>Open Alerts</span>
                    <strong id="openAlertsCount">—</strong>
                    <small>Requires attention</small>
                </div>

                <div class="security-metric-card">
                    <span>Successful Logins</span>
                    <strong id="successfulLoginsCount">—</strong>
                    <small>Last 10 minutes</small>
                </div>

                <div class="security-metric-card">
                    <span>Total Attempts</span>
                    <strong id="totalAttemptsCount">—</strong>
                    <small>Last 10 minutes</small>
                </div>

            </div>


            <!-- Alerts -->

            <div class="security-section">

                <div class="section-heading">
                    <div>
                        <h3>Active Security Alerts</h3>
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
                        <h3>Recent Authentication Activity</h3>
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

  loadSecurityData();
  subscribeToSecurityEvents();
}

// security data loader

async function loadSecurityData() {
  console.log("Loading security center data...");

  await Promise.all([
    loadSecurityMetrics(),
    loadSecurityAlerts(),
    loadRecentLoginAttempts(),
  ]);
}

// security metrics loader
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

  const totalAttempts = data.length;

  const failedAttempts = data.filter((attempt) => !attempt.successful).length;

  const successfulLogins = data.filter((attempt) => attempt.successful).length;

  document.getElementById("totalAttemptsCount").textContent = totalAttempts;

  document.getElementById("failedAttemptsCount").textContent = failedAttempts;

  document.getElementById("successfulLoginsCount").textContent =
    successfulLogins;

  // Open alerts

  const { count, error: alertError } = await supabaseClient
    .from("security_alerts")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "open");

  if (alertError) {
    console.error("Alert count error:", alertError);

    return;
  }

  document.getElementById("openAlertsCount").textContent = count || 0;
}

// load security alerts
async function loadSecurityAlerts() {
  const container = document.getElementById("security-alerts");

  if (!container) return;

  container.innerHTML = `
        <div class="security-loading">
            Loading security alerts...
        </div>
    `;

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading security alerts:", error);

    container.innerHTML = `
            <div class="security-error">
                Unable to load security alerts.
            </div>
        `;

    return;
  }

  if (!alerts || alerts.length === 0) {
    container.innerHTML = `
            <div class="empty-security-state">
                <strong>No active security alerts</strong>
                <span>
                    The monitoring system has not detected any unresolved incidents.
                </span>
            </div>
        `;

    return;
  }

  container.innerHTML = alerts
    .map((alert) => {
      const severity = escapeHtml(alert.severity || "medium");
      const status = escapeHtml(alert.status || "open");

      const alertType = escapeHtml(
        (alert.alert_type || "security alert").replace(/_/g, " "),
      );

      const email = escapeHtml(alert.email || "Unknown");

      const description = escapeHtml(
        alert.description || "Suspicious activity detected.",
      );

      const createdAt = new Date(alert.created_at).toLocaleString();

      let actionButtons = `
                <button
                    class="details-button"
                    onclick="openAlertDetails(${alert.id})"
                >
                    View Details
                </button>
            `;

      if (alert.status === "open") {
        actionButtons += `
                    <button
                        class="investigate-button"
                        onclick="investigateAlert(${alert.id})"
                    >
                        Start Investigation
                    </button>
                `;
      }

      if (alert.status === "investigating") {
        actionButtons += `
                    <button
                        class="resolve-button"
                        onclick="openResolveDialog(${alert.id})"
                    >
                        Resolve Alert
                    </button>
                `;
      }

      return `
                <div class="security-alert">

                    <div class="alert-indicator"></div>

                    <div class="alert-content">

                        <div class="alert-top">
                            <div>
                                <strong>
                                    ${alertType}
                                </strong>
                            </div>

                            <span class="severity ${severity}">
                                ${severity}
                            </span>
                        </div>

                        <p>
                            ${description}
                        </p>

                        <small>
                            Account: ${email}
                            &nbsp; • &nbsp;
                            ${alert.attempt_count || 0} failed attempts
                            &nbsp; • &nbsp;
                            ${createdAt}
                        </small>

                        <div class="alert-status">
                            Status:
                            <strong>
                                ${status}
                            </strong>
                        </div>

                        <div class="alert-actions">
                            ${actionButtons}
                        </div>

                    </div>

                </div>
            `;
    })
    .join("");
}

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
    console.error("Unable to load alert details:", error);

    window.alert("Unable to load security alert details.");
    return;
  }

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
    .order("attempted_at", { ascending: false })
    .limit(50);

  if (attemptsError) {
    console.error("Unable to load related attempts:", attemptsError);
  }

  const attemptList = attempts || [];

  const attemptsHtml =
    attemptList.length > 0
      ? attemptList
          .map(
            (attempt) => `
                        <div class="incident-attempt">

                            <div>
                                <strong>
                                    Failed login
                                </strong>

                                <small>
                                    ${new Date(
                                      attempt.attempted_at,
                                    ).toLocaleString()}
                                </small>
                            </div>

                            <span>
                                ${escapeHtml(
                                  attempt.user_agent || "Unknown user agent",
                                )}
                            </span>

                        </div>
                    `,
          )
          .join("")
      : `
                <p>
                    No recent failed attempts were found for this account.
                </p>
            `;

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
                    <small>SECURITY INCIDENT</small>

                    <h2>
                        ${escapeHtml(
                          (
                            securityAlert.alert_type || "Security Alert"
                          ).replace(/_/g, " "),
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
                    <span>Account</span>
                    <strong>
                        ${escapeHtml(securityAlert.email || "Unknown")}
                    </strong>
                </div>

                <div>
                    <span>Severity</span>
                    <strong class="incident-severity ${escapeHtml(
                      securityAlert.severity || "medium",
                    )}">
                        ${escapeHtml(securityAlert.severity || "medium")}
                    </strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>
                        ${escapeHtml(securityAlert.status || "open")}
                    </strong>
                </div>

                <div>
                    <span>Failed Attempts</span>
                    <strong>
                        ${securityAlert.attempt_count || 0}
                    </strong>
                </div>

            </div>

            <div class="incident-description">

                <h3>Incident Description</h3>

                <p>
                    ${escapeHtml(
                      securityAlert.description || "No description available.",
                    )}
                </p>

            </div>

            <div class="incident-activity">

                <h3>Recent Login Activity</h3>

                ${attemptsHtml}

            </div>

            ${
              securityAlert.investigated_at
                ? `
                        <div class="incident-notes">

                            <h3>Investigation</h3>

                            <p>
                                Investigation started:
                                ${new Date(
                                  securityAlert.investigated_at,
                                ).toLocaleString()}
                            </p>

                        </div>
                    `
                : ""
            }

            ${
              securityAlert.resolution_notes
                ? `
                        <div class="incident-notes">

                            <h3>Resolution Notes</h3>

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
                    <small>SECURITY INCIDENT</small>
                    <h2>Resolve Alert</h2>
                </div>

                <button
                    class="modal-close"
                    onclick="closeResolveDialog()"
                >
                    &times;
                </button>

            </div>

            <div class="resolution-form">

                <label for="resolution-notes">
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

// small helper function to escape HTML
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

//load recent authentication activity
async function loadRecentLoginAttempts() {
  const container = document.getElementById("loginAttempts");

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
                Unable to load authentication activity.
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

            <div class="attempt-row attempt-header">

                <span>Email</span>
                <span>Status</span>
                <span>Time</span>

            </div>

            ${attempts
              .map(
                (attempt) => `

                <div class="attempt-row">

                    <span>
                        ${escapeHtml(attempt.email)}
                    </span>

                    <span class="${
                      attempt.successful ? "login-success" : "login-failed"
                    }">

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
function formatAttemptTime(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// Logout

logoutButton.addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);

    return;
  }

  window.location.href = "../index.html";
});

// Adding the realtime listener

let securityRealtimeChannel = null;

function subscribeToSecurityEvents() {
  // Remove an existing subscription if one exists
  if (securityRealtimeChannel) {
    supabaseClient.removeChannel(securityRealtimeChannel);
    securityRealtimeChannel = null;
  }

  securityRealtimeChannel = supabaseClient
    .channel("security-monitoring")

    // New security alerts
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "security_alerts",
      },
      async (payload) => {
        console.log("New security alert:", payload.new);

        await loadSecurityMetrics();
        await loadSecurityAlerts();

        showSecurityNotification("New security alert detected");
      },
    )

    // New login attempts
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

// notification function
function showSecurityNotification(message) {
  const notification = document.createElement("div");

  notification.className = "security-toast";

  notification.innerHTML = `
        <div class="security-toast-dot"></div>
        <div>
            <strong>Security Alert</strong>
            <p>${escapeHtml(message)}</p>
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

// Start dashboard

loadDashboard();
