import { useId, useMemo, useState } from "react";

const laneOptions = [
  {
    id: "ops",
    label: "Operations lane",
    owner: "Mina",
    detail: "Keeps restart sequencing visible for operators coordinating traffic return.",
  },
  {
    id: "support",
    label: "Support approvals lane",
    owner: "Jordan",
    detail: "Confirms support can resume standard queue handling after restart safeguards clear.",
  },
  {
    id: "finance",
    label: "Finance settlement lane",
    owner: "Priya",
    detail: "Holds finance restarts until customer and support recovery checks are complete.",
  },
] as const;

const keyboardChecklist = [
  "Arrow keys move the active option inside the listbox.",
  "Home and End jump to the first and last options.",
  "Enter or Space selects the currently active option.",
  "aria-activedescendant keeps screen readers aligned with keyboard movement.",
] as const;

export default function AccessibleListboxSample() {
  const listboxId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activityLog, setActivityLog] = useState<readonly string[]>([
    "Focus the listbox and use Arrow keys, Home, End, Enter, or Space to navigate it without the pointer.",
  ]);

  const activeOption = laneOptions[activeIndex] ?? laneOptions[0];
  const selectedOption = laneOptions[selectedIndex] ?? laneOptions[0];

  const optionIds = useMemo(
    () => laneOptions.map((option) => `${listboxId}-${option.id}`),
    [listboxId],
  );

  function pushLog(message: string) {
    setActivityLog((currentLog) => [message, ...currentLog].slice(0, 5));
  }

  function moveActiveIndex(nextIndex: number) {
    setActiveIndex(nextIndex);
    const nextOption = laneOptions[nextIndex];
    if (nextOption) {
      pushLog(`Moved active option to ${nextOption.label}.`);
    }
  }

  function selectIndex(nextIndex: number) {
    setSelectedIndex(nextIndex);
    const nextOption = laneOptions[nextIndex];
    if (nextOption) {
      pushLog(`Selected ${nextOption.label} for the handoff lane.`);
    }
  }

  return (
    <div className="accessible-listbox-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Accessible listbox keyboard navigation</h3>
      </div>

      <p className="section-copy">
        This sample focuses on a practical interview accessibility topic: a listbox that supports arrow-key
        navigation, Home and End jumps, selection without the pointer, and screen-reader friendly active-option state.
      </p>

      <div className="accessible-listbox-sample__summary">
        <article className="sample-card">
          <p className="eyebrow">Active option</p>
          <h4>{activeOption.label}</h4>
          <p>{activeOption.detail}</p>
        </article>
        <article className="sample-card">
          <p className="eyebrow">Selected owner</p>
          <h4>{selectedOption.owner}</h4>
          <p>{selectedOption.label}</p>
        </article>
      </div>

      <div className="accessible-listbox-sample__layout">
        <section className="sample-card accessible-listbox-sample__panel" aria-label="Accessible listbox example">
          <div className="section-heading">
            <p className="eyebrow">Keyboard flow</p>
            <h4>Release handoff lanes</h4>
          </div>

          <div
            className="accessible-listbox-sample__listbox"
            role="listbox"
            aria-label="Release handoff lanes"
            aria-activedescendant={optionIds[activeIndex]}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActiveIndex((activeIndex + 1) % laneOptions.length);
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActiveIndex((activeIndex - 1 + laneOptions.length) % laneOptions.length);
                return;
              }

              if (event.key === "Home") {
                event.preventDefault();
                moveActiveIndex(0);
                return;
              }

              if (event.key === "End") {
                event.preventDefault();
                moveActiveIndex(laneOptions.length - 1);
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectIndex(activeIndex);
              }
            }}
          >
            {laneOptions.map((option, index) => {
              const isActive = index === activeIndex;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={option.id}
                  id={optionIds[index]}
                  className={`accessible-listbox-sample__option${isActive ? " is-active" : ""}${isSelected ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    setActiveIndex(index);
                    selectIndex(index);
                  }}
                >
                  <div>
                    <strong>{option.label}</strong>
                    <p>{option.detail}</p>
                  </div>
                  <span>{option.owner}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="sample-card accessible-listbox-sample__panel" aria-label="Listbox checklist and log">
          <div className="section-heading">
            <p className="eyebrow">Interview angle</p>
            <h4>What to verify</h4>
          </div>

          <ul className="summary-list accessible-listbox-sample__checklist">
            {keyboardChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="portal-log accessible-listbox-sample__log">
            {activityLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}