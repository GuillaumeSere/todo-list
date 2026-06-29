import React, { useEffect, useRef, useState } from "react";

const PRIORITY_LABELS = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

const formatDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateString}T00:00:00`));
};

const getDraftFromTask = (task) => ({
  title: task.title,
  notes: task.notes,
  dueDate: task.dueDate,
  priority: task.priority,
  category: task.category,
});

const Todo = ({
  task,
  today,
  categories,
  toggleTaskCompleted,
  deleteTask,
  editTask,
}) => {
  const [isEditing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => getDraftFromTask(task));
  const [error, setError] = useState("");

  const editFieldRef = useRef(null);
  const editButtonRef = useRef(null);
  const wasEditingRef = useRef(false);

  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
  const isDueToday = !task.completed && task.dueDate === today;

  const updateDraft = (field) => (event) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: event.target.value,
    }));
    setError("");
  };

  const startEditing = () => {
    setDraft(getDraftFromTask(task));
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(getDraftFromTask(task));
    setError("");
    setEditing(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.title.trim()) {
      setError("Le titre ne peut pas etre vide.");
      return;
    }

    editTask(task.id, {
      ...draft,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      category: draft.category.trim() || "General",
    });
    setEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      cancelEditing();
    }
  };

  const dueLabel = task.dueDate
    ? isOverdue
      ? `En retard: ${formatDate(task.dueDate)}`
      : isDueToday
      ? "Aujourd'hui"
      : formatDate(task.dueDate)
    : "Sans date";

  useEffect(() => {
    if (isEditing) {
      editFieldRef.current?.focus();
    } else if (wasEditingRef.current) {
      editButtonRef.current?.focus();
    }
    wasEditingRef.current = isEditing;
  }, [isEditing]);

  if (isEditing) {
    return (
      <li className="todo">
        <form className="todo-edit-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <label className="field">
            <span>Titre</span>
            <input
              type="text"
              value={draft.title}
              onChange={updateDraft("title")}
              ref={editFieldRef}
            />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea rows="3" value={draft.notes} onChange={updateDraft("notes")} />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Echeance</span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={updateDraft("dueDate")}
              />
            </label>

            <label className="field">
              <span>Priorite</span>
              <select value={draft.priority} onChange={updateDraft("priority")}>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Categorie</span>
            <input
              type="text"
              list={`categories-${task.id}`}
              value={draft.category}
              onChange={updateDraft("category")}
            />
            <datalist id={`categories-${task.id}`}>
              {categories.map((category) => (
                <option value={category} key={category} />
              ))}
            </datalist>
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="todo-actions">
            <button type="button" className="secondary-button" onClick={cancelEditing}>
              Annuler
            </button>
            <button type="submit" className="primary-button compact-button">
              Enregistrer
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`todo ${task.completed ? "is-complete" : ""} ${
        isOverdue ? "is-overdue" : ""
      }`}
    >
      <article className="todo-card">
        <label className="todo-check">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompleted(task.id)}
            aria-label={`Basculer ${task.title}`}
          />
          <span aria-hidden="true" />
        </label>

        <div className="todo-content">
          <div className="todo-topline">
            <h3>{task.title}</h3>
            <span className={`priority-badge priority-${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.notes && <p className="todo-notes">{task.notes}</p>}

          <div className="todo-meta">
            <span className={isOverdue ? "meta-chip danger" : isDueToday ? "meta-chip today" : "meta-chip"}>
              {dueLabel}
            </span>
            <span className="meta-chip">{task.category}</span>
          </div>
        </div>

        <div className="todo-actions">
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={startEditing}
            ref={editButtonRef}
          >
            Modifier
          </button>
          <button
            type="button"
            className="danger-button compact-button"
            onClick={() => deleteTask(task.id)}
          >
            Supprimer
          </button>
        </div>
      </article>
    </li>
  );
};

export default Todo;
