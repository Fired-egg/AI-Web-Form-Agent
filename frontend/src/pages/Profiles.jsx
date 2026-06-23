import { useEffect, useState } from "react";

import { api } from "../api";
import Message from "../components/Message";

const emptyProfile = {
  profile_name: "",
  full_name: "",
  email: "",
  phone: "",
  university: "",
  major: "",
  linkedin: "",
  github: "",
  self_intro: "",
};

const fields = [
  ["profile_name", "Profile name", "text", true],
  ["full_name", "Full name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone", "tel"],
  ["university", "University", "text"],
  ["major", "Major", "text"],
  ["linkedin", "LinkedIn", "url"],
  ["github", "GitHub", "url"],
];

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(emptyProfile);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProfiles() {
    setLoading(true);
    setError("");
    try {
      setProfiles(await api.listProfiles());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyProfile);
    setEditingId(null);
  }

  function startEditing(profile) {
    const editableValues = Object.fromEntries(
      Object.keys(emptyProfile).map((key) => [key, profile[key] ?? ""]),
    );
    setForm(editableValues);
    setEditingId(profile.id);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingId) {
        await api.updateProfile(editingId, form);
        setNotice("Profile updated.");
      } else {
        await api.createProfile(form);
        setNotice("Profile created.");
      }
      resetForm();
      await loadProfiles();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(profile) {
    if (!window.confirm(`Delete "${profile.profile_name}"?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await api.deleteProfile(profile.id);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      if (editingId === profile.id) {
        resetForm();
      }
      setNotice("Profile deleted.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Reusable data</p>
          <h2>Profiles</h2>
          <p>Create and maintain the information used to fill forms.</p>
        </div>
      </div>

      <Message type="error">{error}</Message>
      <Message type="success">{notice}</Message>

      <div className="two-column">
        <form className="card form-card" onSubmit={submitProfile}>
          <div className="section-heading">
            <h3>{editingId ? "Edit profile" : "Create profile"}</h3>
            {editingId && (
              <button className="button button-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <div className="form-grid">
            {fields.map(([name, label, type, required]) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={updateForm}
                  required={required}
                />
              </label>
            ))}
          </div>

          <label>
            Self introduction
            <textarea
              name="self_intro"
              rows="5"
              value={form.self_intro}
              onChange={updateForm}
            />
          </label>

          <button className="button" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Create profile"}
          </button>
        </form>

        <div>
          <div className="section-heading">
            <h3>Saved profiles</h3>
            <button className="text-button" type="button" onClick={loadProfiles}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading profiles...</p>
          ) : profiles.length === 0 ? (
            <div className="card empty-state">
              <p>No profiles yet. Create your first one.</p>
            </div>
          ) : (
            <div className="stack">
              {profiles.map((profile) => (
                <article className="card profile-card" key={profile.id}>
                  <div className="section-heading">
                    <div>
                      <h3>{profile.profile_name}</h3>
                      <p>{profile.full_name || "No full name"}</p>
                    </div>
                    <span className="badge">#{profile.id}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Email</dt>
                      <dd>{profile.email || "—"}</dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>{profile.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt>Education</dt>
                      <dd>
                        {[profile.university, profile.major].filter(Boolean).join(" · ") || "—"}
                      </dd>
                    </div>
                  </dl>
                  <div className="button-row">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => startEditing(profile)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button-danger"
                      type="button"
                      onClick={() => deleteProfile(profile)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Profiles;
