import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import React, { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

const STORAGE_KEY = "todo-list.tasks.v2";
const LEGACY_STORAGE_KEY = "tasks";
const DEFAULT_CATEGORY = "General";

const PRIORITIES = {
  high: { label: "Haute", weight: 3 },
  medium: { label: "Moyenne", weight: 2 },
  low: { label: "Basse", weight: 1 },
};

const FILTERS = [
  { key: "all", label: "Toutes", predicate: () => true },
  { key: "active", label: "A faire", predicate: (task) => !task.completed },
  {
    key: "today",
    label: "Aujourd'hui",
    predicate: (task, today) => !task.completed && task.dueDate === today,
  },
  {
    key: "overdue",
    label: "En retard",
    predicate: (task, today) =>
      !task.completed && task.dueDate && task.dueDate < today,
  },
  { key: "completed", label: "Terminees", predicate: (task) => task.completed },
];

const getToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const createTask = (task) => ({
  id: task.id || `todo-${nanoid()}`,
  title: (task.title || task.name || "Nouvelle tache").trim(),
  notes: task.notes || "",
  completed: Boolean(task.completed),
  priority: PRIORITIES[task.priority] ? task.priority : "medium",
  category: (task.category || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY,
  dueDate: task.dueDate || "",
  createdAt: task.createdAt || new Date().toISOString(),
  completedAt: task.completed ? task.completedAt || new Date().toISOString() : null,
});

const readTasks = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed.map(createTask) : null;
  } catch (error) {
    return null;
  }
};

const loadInitialTasks = (fallbackTasks) => {
  return (
    readTasks(STORAGE_KEY) ||
    readTasks(LEGACY_STORAGE_KEY) ||
    fallbackTasks.map(createTask)
  );
};

const matchesSearch = (task, query) => {
  if (!query) {
    return true;
  }

  const content = `${task.title} ${task.notes} ${task.category}`.toLowerCase();
  return content.includes(query);
};

const compareDueDate = (a, b) => {
  if (!a.dueDate && !b.dueDate) {
    return 0;
  }
  if (!a.dueDate) {
    return 1;
  }
  if (!b.dueDate) {
    return -1;
  }
  return a.dueDate.localeCompare(b.dueDate);
};

const sortTasks = (tasks, sortBy) => {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortBy === "priority") {
      return PRIORITIES[b.priority].weight - PRIORITIES[a.priority].weight;
    }

    if (sortBy === "created") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    const dueComparison = compareDueDate(a, b);
    if (sortBy === "due" || dueComparison !== 0) {
      return dueComparison;
    }

    const priorityComparison =
      PRIORITIES[b.priority].weight - PRIORITIES[a.priority].weight;
    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export default function App(props) {
  const [tasks, setTasks] = useState(() => loadInitialTasks(props.tasks || []));
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("smart");

  const today = getToday();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const overdue = tasks.filter(
      (task) => !task.completed && task.dueDate && task.dueDate < today
    ).length;
    const dueToday = tasks.filter(
      (task) => !task.completed && task.dueDate === today
    ).length;

    return {
      total: tasks.length,
      completed,
      active: tasks.length - completed,
      overdue,
      dueToday,
      progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [tasks, today]);

  const categories = useMemo(() => {
    const unique = new Set([DEFAULT_CATEGORY, ...tasks.map((task) => task.category)]);
    return [...unique].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filterCounts = useMemo(() => {
    return FILTERS.reduce((counts, item) => {
      counts[item.key] = tasks.filter((task) => item.predicate(task, today)).length;
      return counts;
    }, {});
  }, [tasks, today]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeFilter = FILTERS.find((item) => item.key === filter) || FILTERS[0];

    return sortTasks(
      tasks
        .filter((task) => activeFilter.predicate(task, today))
        .filter((task) => matchesSearch(task, query)),
      sortBy
    );
  }, [filter, search, sortBy, tasks, today]);

  const addTask = (taskDetails) => {
    const title = taskDetails.title.trim();
    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      createTask({
        ...taskDetails,
        title,
        id: `todo-${nanoid()}`,
        completed: false,
        createdAt: new Date().toISOString(),
      }),
      ...currentTasks,
    ]);
  };

  const toggleTaskCompleted = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };
      })
    );
  };

  const editTask = (id, updates) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? createTask({
              ...task,
              ...updates,
              id: task.id,
              createdAt: task.createdAt,
              completedAt: task.completedAt,
            })
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  };

  const taskList = visibleTasks.map((task) => (
    <Todo
      task={task}
      key={task.id}
      today={today}
      categories={categories}
      toggleTaskCompleted={toggleTaskCompleted}
      deleteTask={deleteTask}
      editTask={editTask}
    />
  ));

  const taskNoun = visibleTasks.length > 1 ? "taches" : "tache";
  const headingText = `${visibleTasks.length} ${taskNoun}`;
  const progressLabel = `${stats.progress}% termine`;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Tableau de bord</p>
          <h1>Todo List</h1>
          <p className="header-copy">
            {stats.active === 0
              ? "Tout est boucle pour le moment."
              : `${stats.active} action(s) ouverte(s), ${stats.dueToday} pour aujourd'hui.`}
          </p>
        </div>
        <div className="progress-card" aria-label={progressLabel}>
          <span>{stats.progress}%</span>
          <small>termine</small>
        </div>
      </header>

      <section className="stats-grid" aria-label="Synthese des taches">
        <article className="metric-card">
          <span>A faire</span>
          <strong>{stats.active}</strong>
        </article>
        <article className="metric-card">
          <span>Aujourd'hui</span>
          <strong>{stats.dueToday}</strong>
        </article>
        <article className="metric-card metric-card-danger">
          <span>En retard</span>
          <strong>{stats.overdue}</strong>
        </article>
        <article className="metric-card metric-card-success">
          <span>Terminees</span>
          <strong>{stats.completed}</strong>
        </article>
      </section>

      <div className="workspace-grid">
        <section className="compose-panel" aria-labelledby="new-task-heading">
          <Form addTask={addTask} categories={categories} />
        </section>

        <section className="tasks-panel" aria-labelledby="list-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Mes actions</p>
              <h2 id="list-heading">{headingText}</h2>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={clearCompleted}
              disabled={stats.completed === 0}
            >
              Nettoyer
            </button>
          </div>

          <div className="toolbar" aria-label="Recherche et tri">
            <label className="search-field">
              <span className="visually-hidden">Rechercher une tache</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher"
              />
            </label>

            <label className="sort-field">
              <span>Tri</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="smart">Intelligent</option>
                <option value="due">Echeance</option>
                <option value="priority">Priorite</option>
                <option value="created">Creation</option>
              </select>
            </label>
          </div>

          <div className="filters" role="group" aria-label="Filtrer les taches">
            {FILTERS.map((item) => (
              <FilterButton
                key={item.key}
                label={item.label}
                value={item.key}
                count={filterCounts[item.key]}
                isPressed={item.key === filter}
                setFilter={setFilter}
              />
            ))}
          </div>

          {taskList.length ? (
            <ul className="todo-list" aria-labelledby="list-heading">
              {taskList}
            </ul>
          ) : (
            <div className="empty-state">
              <strong>Aucune tache ici.</strong>
              <span>
                {search
                  ? "Essaie une autre recherche."
                  : "Ajoute une action pour lancer la liste."}
              </span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
