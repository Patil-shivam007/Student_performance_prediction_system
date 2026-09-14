import { useEffect, useState } from "react";
import "./Settings.css";

const Settings = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });

  const [language, setLanguage] = useState("English");
  const [privacy, setPrivacy] = useState("Private");
  const [parentEmail, setParentEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (value) => {
    setTheme(value);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    alert("Password change request submitted.");
  };

  const handleParentLink = (event) => {
    event.preventDefault();

    if (!parentEmail.trim()) {
      alert("Please enter a parent/guardian email.");
      return;
    }

    alert(`Guardian link request sent to ${parentEmail}.`);
  };

  const handleDeactivate = () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account?"
    );

    if (confirmed) {
      alert("Account deactivation request submitted.");
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "This action is permanent. Are you sure you want to delete your account?"
    );

    if (confirmed) {
      alert("Account deletion request submitted.");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-eyebrow">
            <span className="settings-eyebrow-dot"></span>
            ACCOUNT CENTER
          </div>

          <h2>Settings</h2>
          <p>Manage your profile, security, preferences and privacy.</p>
        </div>

        {/* Profile */}
        <section className="settings-card profile-card">
          <div className="card-title-row">
            <div className="card-icon profile-icon">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <h3>Profile</h3>
              <p>Manage your personal information.</p>
            </div>
          </div>

          <div className="profile-layout">
            <div className="profile-photo-wrapper">
              <div className="profile-photo">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" />
                ) : (
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                )}
              </div>

              <label className="photo-button">
                <span className="material-symbols-outlined">photo_camera</span>
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                />
              </label>
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" />
              </div>

              <div className="field-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" />
              </div>

              <div className="field-group">
                <label>Phone</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="settings-card">
          <div className="card-title-row">
            <div className="card-icon security-icon">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div>
              <h3>Change Password</h3>
              <p>Keep your account secure with a strong password.</p>
            </div>
          </div>

          <form className="password-form" onSubmit={handlePasswordChange}>
            <div className="field-group">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" />
            </div>

            <div className="field-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>

            <div className="field-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>

            <button className="primary-button" type="submit">
              <span className="material-symbols-outlined">key</span>
              Update Password
            </button>
          </form>
        </section>

        {/* Theme */}
        <section className="settings-card">
          <div className="card-title-row">
            <div className="card-icon appearance-icon">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <div>
              <h3>Theme</h3>
              <p>Choose how the application looks for you.</p>
            </div>
          </div>

          <div className="theme-options">
            <label
              className={`theme-option ${theme === "light" ? "selected" : ""}`}
            >
              <span className="theme-preview light-preview">
                <span></span>
              </span>

              <div>
                <strong>Light Mode</strong>
                <small>Clean and bright</small>
              </div>

              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === "light"}
                onChange={() => handleThemeChange("light")}
              />

              <span className="radio-check"></span>
            </label>

            <label
              className={`theme-option ${theme === "dark" ? "selected" : ""}`}
            >
              <span className="theme-preview dark-preview">
                <span></span>
              </span>

              <div>
                <strong>Dark Mode</strong>
                <small>Comfortable at night</small>
              </div>

              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === "dark"}
                onChange={() => handleThemeChange("dark")}
              />

              <span className="radio-check"></span>
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <div className="card-title-row">
            <div className="card-icon notification-icon">
              <span className="material-symbols-outlined">notifications</span>
            </div>
            <div>
              <h3>Notifications</h3>
              <p>Receive alerts about grades and attendance.</p>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-row-info">
              <span className="material-symbols-outlined">mail</span>
              <div>
                <strong>Email Alerts</strong>
                <small>Grades, attendance and important updates</small>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    email: !prev.email,
                  }))
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-row-info">
              <span className="material-symbols-outlined">sms</span>
              <div>
                <strong>SMS Alerts</strong>
                <small>Attendance and academic notifications</small>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    sms: !prev.sms,
                  }))
                }
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Language */}
        <section className="settings-card">
          <div className="card-title-row">
            <div className="card-icon language-icon">
              <span className="material-symbols-outlined">language</span>
            </div>
            <div>
              <h3>Language</h3>
              <p>Select your preferred application language.</p>
            </div>
          </div>

          <div className="select-wrapper">
            <span className="material-symbols-outlined">translate</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </div>
        </section>

        {/* Privacy */}
        <section className="settings-card">
          <div className="card-title-row">
            <div className="card-icon privacy-icon">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <div>
              <h3>Privacy</h3>
              <p>Control who can see your profile and performance data.</p>
            </div>
          </div>

          <div className="privacy-options">
            {[
              {
                value: "Private",
                label: "Private",
                description: "Only you can view your performance data.",
              },
              {
                value: "Teachers",
                label: "Teachers & Admin",
                description: "Teachers and authorized administrators can view it.",
              },
              {
                value: "School",
                label: "School Community",
                description: "Visible to authorized members of your institution.",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`privacy-option ${
                  privacy === option.value ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={option.value}
                  checked={privacy === option.value}
                  onChange={() => setPrivacy(option.value)}
                />

                <div>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </div>

                <span className="radio-check"></span>
              </label>
            ))}
          </div>
        </section>

        {/* Linked Accounts */}
        <section className="settings-card">
          <div className="card-title-row">
            <div className="card-icon linked-icon">
              <span className="material-symbols-outlined">link</span>
            </div>
            <div>
              <h3>Linked Accounts</h3>
              <p>Connect a parent or guardian for academic updates.</p>
            </div>
          </div>

          <form className="guardian-form" onSubmit={handleParentLink}>
            <div className="field-group">
              <label>Parent / Guardian Email</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                placeholder="parent@example.com"
              />
            </div>

            <button className="secondary-button" type="submit">
              <span className="material-symbols-outlined">person_add</span>
              Send Link Request
            </button>
          </form>
        </section>

        {/* Delete / Deactivate */}
        <section className="settings-card danger-card">
          <div className="card-title-row">
            <div className="card-icon danger-icon">
              <span className="material-symbols-outlined">manage_accounts</span>
            </div>
            <div>
              <h3>Account Management</h3>
              <p>Deactivate temporarily or permanently delete your account.</p>
            </div>
          </div>

          <div className="danger-actions">
            <div>
              <strong>Deactivate Account</strong>
              <small>
                Temporarily disable your account. Your data can be restored later.
              </small>
            </div>

            <button
              className="danger-outline-button"
              type="button"
              onClick={handleDeactivate}
            >
              Deactivate
            </button>
          </div>

          <div className="danger-actions delete-action">
            <div>
              <strong>Delete Account</strong>
              <small>
                Permanently remove your account and associated data.
              </small>
            </div>

            <button
              className="danger-button"
              type="button"
              onClick={handleDelete}
            >
              Delete Account
            </button>
          </div>
        </section>

        <div className="settings-footer-note">
          <span className="material-symbols-outlined">verified_user</span>
          Your settings are stored securely.
        </div>
      </div>
    </div>
  );
};

export default Settings;
