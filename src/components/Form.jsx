import React, { useState } from "react";

const emptyDraft = {
  title: "",
  notes: "",
  dueDate: "",
  priority: "medium",
  category: "General",
};

const Form = ({ addTask, categories }) => {
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");

  const updateDraft = (field) => (event) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: event.target.value,
    }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.title.trim()) {
      setError("Donne un titre a ta tache.");
      return;
    }

    addTask({
      ...draft,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      category: draft.category.trim() || "General",
    });
    setDraft(emptyDraft);
    setError("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <p className="eyebrow">Nouvelle tache</p>
        <h2 id="new-task-heading">Ajouter une action</h2>
      </div>

      <label className="field">
        <span>Titre</span>
        <input
          type="text"
          value={draft.title}
          onChange={updateDraft("title")}
          placeholder="Ex: preparer la demo"
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows="4"
          value={draft.notes}
          onChange={updateDraft("notes")}
          placeholder="Details, contexte, prochaines etapes"
        />
      </label>

      <div className="form-grid">
        <label className="field">
          <span>Echeance</span>
          <input type="date" value={draft.dueDate} onChange={updateDraft("dueDate")} />
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
          list="task-categories"
          value={draft.category}
          onChange={updateDraft("category")}
          placeholder="General"
        />
        <datalist id="task-categories">
          {categories.map((category) => (
            <option value={category} key={category} />
          ))}
        </datalist>
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="primary-button">
        Ajouter la tache
      </button>
    </form>
  );
};

export default Form;
