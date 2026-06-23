import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, API_BASE_URL } from "../api";
import Message from "../components/Message";

function Dashboard() {
  const [health, setHealth] = useState("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .health()
      .then((result) => setHealth(result.status))
      .catch((requestError) => {
        setHealth("offline");
        setError(requestError.message);
      });
  }, []);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
          <p>Create a reusable profile, then start a form analysis task.</p>
        </div>
        <Link className="button" to="/tasks/new">
          Create task
        </Link>
      </div>

      <div className="card-grid">
        <article className="card">
          <h3>Backend status</h3>
          <p className={`status status-${health}`}>
            <span aria-hidden="true" />
            {health === "checking" ? "Checking..." : health}
          </p>
          <p className="muted">{API_BASE_URL}</p>
          <Message type="error">{error}</Message>
        </article>

        <article className="card">
          <h3>1. Prepare profile</h3>
          <p>Save the information you commonly use in forms.</p>
          <Link to="/profiles">Manage profiles</Link>
        </article>

        <article className="card">
          <h3>2. Analyze a form</h3>
          <p>Create a task using a target URL and one profile.</p>
          <Link to="/tasks/new">Create a task</Link>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
