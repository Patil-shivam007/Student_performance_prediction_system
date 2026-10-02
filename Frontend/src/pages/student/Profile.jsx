import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Profile.css";

/* ============================================================
   ICON COMPONENTS
============================================================ */

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3h3l2 5-2 1.5a15 15 0 0 0 4.5 4.5L16 12l5 2v3c0 1.1-.9 2-2 2C10.7 19 5 13.3 5 5c0-1.1.9-2 2-2Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

const GenderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="9" r="4" />
    <path d="M12 6l5-5M14 1h3v3M9 13v7M6 17h6" />
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m2 9 10-5 10 5-10 5L2 9Z" />
    <path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M15 15c3 0 5 1.5 6 4" />
  </svg>
);

const BadgeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3h10v4a5 5 0 0 1-10 0V3Z" />
    <path d="M5 8v13h14V8M8 21v-4h8v4M9 12h6" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 20 6v6c0 5-3.3 8-8 9-4.7-1-8-4-8-9V6l8-3Z" />
    <path d="m8.5 12 2.3 2.3 4.7-5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);


/* ============================================================
   PROFILE COMPONENT
============================================================ */

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("student/profile/");

        console.log("Student Profile:", response.data);

        setProfile(response.data);
      } catch (error) {
        console.error(
          "Profile Error:",
          error.response?.data
        );

        setError(
          error.response?.data?.error ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading-card">
          <div className="profile-loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error-card">
          <div className="profile-error-icon">!</div>

          <div>
            <h3>Unable to load profile</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }


  /* ==========================================================
     NO PROFILE
  ========================================================== */

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-loading-card">
          <div className="profile-empty-icon">?</div>
          <h3>No profile information</h3>
          <p>
            Profile information is currently unavailable.
          </p>
        </div>
      </div>
    );
  }


  /* ==========================================================
     PROFILE DATA
  ========================================================== */

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();


  const displayName = fullName || profile.username || "Student";


  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


  const studentClass =
    profile.student_class || "Not provided";

  const division =
    profile.division || "Not provided";

  const rollNumber =
    profile.roll_number || "Not provided";


  /* ==========================================================
     PROFILE FIELD
  ========================================================== */

  const ProfileField = ({
    icon,
    label,
    value,
  }) => (
    <div className="profile-field">

      <div className="profile-field-icon">
        {icon}
      </div>

      <div className="profile-field-content">
        <span>{label}</span>

        <strong>
          {value || "-"}
        </strong>
      </div>

    </div>
  );


  return (
    <div className="profile-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="profile-header">

        <div>
          <div className="profile-breadcrumb">
            Student Portal <span>/</span> Profile
          </div>

          <h1>My Profile</h1>

          <p>
            View your personal and academic information.
          </p>
        </div>

      </div>


      {/* ======================================================
          PROFILE HERO
      ====================================================== */}

      <div className="profile-hero">

        <div className="profile-hero-main">

          <div className="profile-avatar-wrapper">

            <div className="profile-avatar">
              {initials}
            </div>

            <span
              className="profile-active-dot"
              title="Active student"
            ></span>

          </div>


          <div className="profile-hero-info">

            <div className="profile-name-row">

              <h2>
                {displayName}
              </h2>

              <span className="profile-student-badge">
                <CheckIcon />
                Student
              </span>

            </div>

            <p className="profile-course">
              {studentClass}
            </p>

            <div className="profile-quick-info">

              <span>
                <BadgeIcon />
                Roll No: {rollNumber}
              </span>

              <span>
                <UsersIcon />
                Division: {division}
              </span>

            </div>

          </div>

        </div>


        <div className="profile-status">

          <span className="profile-status-dot"></span>

          <div>
            <strong>Active</strong>
            <small>Student Account</small>
          </div>

        </div>

      </div>


      {/* ======================================================
          PROFILE SUMMARY
      ====================================================== */}

      <div className="profile-summary-grid">

        <div className="profile-summary-card">

          <div className="profile-summary-icon">
            <GraduationIcon />
          </div>

          <div>
            <span>Course / Class</span>
            <strong>{studentClass}</strong>
          </div>

        </div>


        <div className="profile-summary-card">

          <div className="profile-summary-icon">
            <UsersIcon />
          </div>

          <div>
            <span>Division</span>
            <strong>{division}</strong>
          </div>

        </div>


        <div className="profile-summary-card">

          <div className="profile-summary-icon">
            <BadgeIcon />
          </div>

          <div>
            <span>Roll Number</span>
            <strong>{rollNumber}</strong>
          </div>

        </div>


        <div className="profile-summary-card">

          <div className="profile-summary-icon">
            <ShieldIcon />
          </div>

          <div>
            <span>Account Status</span>
            <strong className="profile-active-text">
              Active
            </strong>
          </div>

        </div>

      </div>


      {/* ======================================================
          PERSONAL INFORMATION
      ====================================================== */}

      <div className="profile-card">

        <div className="profile-section-header">

          <div className="profile-section-title-icon">
            <UserIcon />
          </div>

          <div>
            <h3>Personal Information</h3>

            <p>
              Your basic personal details.
            </p>
          </div>

        </div>


        <div className="profile-grid">

          <ProfileField
            icon={<UserIcon />}
            label="Username"
            value={profile.username}
          />

          <ProfileField
            icon={<MailIcon />}
            label="Email Address"
            value={profile.email}
          />

          <ProfileField
            icon={<PhoneIcon />}
            label="Phone Number"
            value={profile.phone}
          />

          <ProfileField
            icon={<CalendarIcon />}
            label="Date of Birth"
            value={profile.date_of_birth}
          />

          <ProfileField
            icon={<GenderIcon />}
            label="Gender"
            value={profile.gender}
          />

        </div>

      </div>


      {/* ======================================================
          ACADEMIC INFORMATION
      ====================================================== */}

      <div className="profile-card">

        <div className="profile-section-header">

          <div className="profile-section-title-icon">
            <GraduationIcon />
          </div>

          <div>
            <h3>Academic Information</h3>

            <p>
              Your current academic details.
            </p>
          </div>

        </div>


        <div className="profile-grid">

          <ProfileField
            icon={<GraduationIcon />}
            label="Class / Course"
            value={profile.student_class}
          />

          <ProfileField
            icon={<UsersIcon />}
            label="Division"
            value={profile.division}
          />

          <ProfileField
            icon={<BadgeIcon />}
            label="Roll Number"
            value={profile.roll_number}
          />

        </div>

      </div>


      {/* ======================================================
          ACCOUNT INFORMATION
      ====================================================== */}

      <div className="profile-account-card">

        <div className="profile-account-icon">
          <ShieldIcon />
        </div>

        <div className="profile-account-content">

          <h3>Account Information</h3>

          <p>
            Your account is currently active and
            available for the student portal.
          </p>

        </div>

        <div className="profile-account-status">

          <span></span>

          Active

        </div>

      </div>

    </div>
  );
}

export default Profile;