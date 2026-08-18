import React, { useEffect, useMemo, useRef, useState } from "react";

export function InputField({ label, value, onChange, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

export function SelectField({ label, value, onChange, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} {...props}>
        {children}
      </select>
    </label>
  );
}

export function SearchableSelect({ label, value, onChange, options, placeholder = "Search or select", emptyLabel = "", disabled = false, required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || null;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption ? selectedOption.label : "");
    }
  }, [isOpen, selectedOption]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function openList() {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
  }

  function selectValue(nextValue) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <label className={disabled ? "field searchable-select disabled" : "field searchable-select"} ref={wrapperRef}>
      <span>{label}</span>
      <input
        value={isOpen ? query : selectedOption?.label || ""}
        placeholder={placeholder}
        disabled={disabled}
        required={required && !value}
        autoComplete="off"
        onFocus={openList}
        onClick={openList}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value) onChange("");
          setIsOpen(true);
        }}
      />
      {isOpen && !disabled && (
        <div className="searchable-options">
          {emptyLabel && (
            <button type="button" className={!value ? "searchable-option selected" : "searchable-option"} onMouseDown={(event) => event.preventDefault()} onClick={() => selectValue("")}>
              {emptyLabel}
            </button>
          )}
          {filteredOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={option.value === value ? "searchable-option selected" : "searchable-option"}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectValue(option.value)}
            >
              {option.label}
            </button>
          ))}
          {!filteredOptions.length && <span className="searchable-empty">No match found</span>}
        </div>
      )}
    </label>
  );
}
