import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Profile.css";

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
        console.error("Profile Error:", error.response?.data);

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

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-message">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-message">
          No profile information available.
        </div>
      </div>
    );
  }

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">

      {/* Header */}

      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>
            View your personal and academic information.
          </p>
        </div>
      </div>

      {/* Profile Card */}

      <div className="profile-card">

        <div className="profile-top">

          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-name">
            <h2>{fullName || "Student"}</h2>
            <span>Student</span>
          </div>

        </div>

        {/* Personal Information */}

        <div className="profile-section">

          <h3>Personal Information</h3>

          <div className="profile-grid">

            <div className="profile-field">
              <span>Username</span>
              <strong>{profile.username || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>Email</span>
              <strong>{profile.email || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>Phone</span>
              <strong>{profile.phone || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>Date of Birth</span>
              <strong>{profile.date_of_birth || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>Gender</span>
              <strong>{profile.gender || "-"}</strong>
            </div>

          </div>

        </div>

        {/* Academic Information */}

        <div className="profile-section">

          <h3>Academic Information</h3>

          <div className="profile-grid">

            <div className="profile-field">
              <span>Class / Course</span>
              <strong>
                {profile.student_class || "-"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Division</span>
              <strong>
                {profile.division || "-"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Roll Number</span>
              <strong>
                {profile.roll_number || "-"}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;