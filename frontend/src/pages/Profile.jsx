
import { useEffect, useState } from "react";
import { UserCircle, Save, Lock, Mail, User } from "lucide-react";
import "./Profile.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    current_password: "",
    new_password: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/me.php`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load profile.");
        }

        const user = data.user;

        setForm({
          name: user.name || "",
          email: user.email || "",
          current_password: "",
          new_password: ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/update_profile.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Profile update failed.");
      }

      setMessage(data.message);

      setForm({
        name: data.user.name,
        email: data.user.email,
        current_password: "",
        new_password: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">

      <div className="profile-heading">
        <h1>My Profile</h1>
        <p>View and manage your personal account information.</p>
      </div>

      <div className="profile-card">

        <div className="profile-card-header">
          <div className="profile-avatar">
            <UserCircle size={65} />
          </div>

          <div>
            <h2>{form.name || "My Account"}</h2>
            <p>{form.email}</p>
          </div>
        </div>

        {message && <div className="profile-success">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <h3>Personal Information</h3>

          <div className="profile-field">
            <label>Full Name</label>
            <div className="profile-input">
              <User size={19} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Email Address</label>
            <div className="profile-input">
              <Mail size={19} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="profile-divider"></div>

          <h3>Change Password</h3>
          <p className="profile-hint">
            Leave both password fields empty if you don't want to change your password.
          </p>

          <div className="profile-field">
            <label>Current Password</label>
            <div className="profile-input">
              <Lock size={19} />
              <input
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>New Password</label>
            <div className="profile-input">
              <Lock size={19} />
              <input
                type="password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                placeholder="Enter new password (minimum 8 characters)"
              />
            </div>
          </div>

          <button
            type="submit"
            className="profile-save-button"
            disabled={saving}
          >
            <Save size={19} />
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Profile;
