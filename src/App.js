import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import React, { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

const FILTER_MAP = {
    All: () => true,
    Active: (task) => !task.completed,
    Complète: (task) => task.completed
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

export default function App(props) {

    const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
    const [filter, setFilter] = useState('All');

    const toggleTaskCompleted = (id) => {
        const updatedTasks = tasks.map((task) => {
            // if this task has the same ID as the edited task
            if (id === task.id) {
                // use object spread to make a new object
                // whose `completed` prop has been inverted
                return { ...task, completed: !task.completed }
            }
            return task;
        });
        setTasks(updatedTasks);
    }

    const editTask = (id, newName) => {
        const editedTaskList = tasks.map((task) => {
            // if this task has the same ID as the edited task
            if (id === task.id) {
                //
                return { ...task, name: newName }
            }
            return task;
        });
        setTasks(editedTaskList);
    }

    const deleteTask = (id) => {
        const remainingTasks = tasks.filter((task) => id !== task.id);
        setTasks(remainingTasks);
    }

    const addTask = (name) => {
        const newTask = { id: `todo-${nanoid()}`, name, completed: false };
        setTasks([...tasks, newTask]);
    }

    const taskList = tasks.filter(FILTER_MAP[filter])
        .map((task) => (
            <Todo
                id={task.id}
                name={task.name}
                completed={task.completed}
                key={task.id}
                toggleTaskCompleted={toggleTaskCompleted}
                deleteTask={deleteTask}
                editTask={editTask}
            />
        ));

    const filterList = FILTER_NAMES.map((name) => (
        <FilterButton
            key={name}
            name={name}
            isPressed={name === filter}
            setFilter={setFilter}
        />
    ));

    const tasksNoun = taskList.length !== 1 ? 'taches' : 'tache';
    const headingText = `${taskList.length} ${tasksNoun} à faire`;
    const listHeadingRef = useRef(null);
    const prevTaskLength = usePrevious(tasks.length);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }, [tasks]);

    return (
        <>
        <h1 className="title">Taches à Faire</h1>
        <div className="todoapp stack-large">
            <h1>Todo-List</h1>
            <Form addTask={addTask} />
            <div className="filters btn-group stack-exception">
                {filterList}
            </div>
            <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
                {headingText}
            </h2>
            <ul
                role="list"
                className="todo-list stack-large stack-exception"
                aria-labelledby="list-heading"
            >
                {taskList}

            </ul>
        </div>
        </>
    );
}

