import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api";
import Message from "../components/Message";

function TaskDetail() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getTask(taskId)
      .then(setTask)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  async function analyze() {
    setAnalyzing(true);
    setError("");
    try {
      const result = await api.analyzeTask(taskId);
      setTask(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return <p>Loading task...</p>;
  }

  return (
    <section>
      <Message type="error">{error}</Message>
      {task && (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">Task #{task.id}</p>
              <h2>Task Detail</h2>
              <p className="break-word">{task.url}</p>
            </div>
            <span className="badge badge-large">{task.status}</span>
          </div>

          <article className="card">
            <dl className="detail-list">
              <div>
                <dt>Profile ID</dt>
                <dd>{task.profile_id}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{task.description || "—"}</dd>
              </div>
              <div>
                <dt>Extracted fields</dt>
                <dd>{task.form_fields.length}</dd>
              </div>
            </dl>
            <div className="button-row">
              <button className="button" type="button" onClick={analyze} disabled={analyzing}>
                {analyzing ? "Analyzing..." : "Analyze form"}
              </button>
              <Link className="button button-secondary" to={`/tasks/${task.id}/review-mapping`}>
                Review mapping
              </Link>
            </div>
          </article>
        </>
      )}
    </section>
  );
}

export default TaskDetail;
