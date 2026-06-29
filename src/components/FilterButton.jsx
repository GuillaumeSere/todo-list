import React from "react";

const FilterButton = ({ label, value, count, isPressed, setFilter }) => {
  return (
    <button
      type="button"
      className="filter-button"
      aria-pressed={isPressed}
      onClick={() => setFilter(value)}
    >
      <span>{label}</span>
      <strong>{count}</strong>
    </button>
  );
};

export default FilterButton;
