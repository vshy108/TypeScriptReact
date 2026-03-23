// Key identity and state preservation
// ------------------------------------
// This sample demonstrates two critical React key behaviors:
//
// 1. KEY={INDEX} REORDER BUG — When a list uses array index as the key,
//    React treats position as identity. If items reorder, React patches the
//    existing DOM nodes with the new data but keeps their internal state
//    (input values, focus, animation state). This causes state to "stick"
//    to the wrong item.
//
// 2. KEY RESET TRICK — Changing a component's key forces React to unmount
//    the old instance and mount a fresh one. This is useful for resetting
//    forms, animations, or any local state without an explicit reset handler.

import { useId, useState } from "react";

type TaskId = `task-${number}`;

interface Task {
  readonly id: TaskId;
  readonly title: string;
}

let nextTaskNumber = 1;

function createTask(title: string): Task {
  return { id: `task-${nextTaskNumber++}`, title };
}

const starterTasks: readonly Task[] = [
  createTask("Normalize reducer actions"),
  createTask("Migrate to React 19 hooks"),
  createTask("Add error boundary coverage"),
  createTask("Profile render bottlenecks"),
];

// ---------------------------------------------------------------------------
// TaskRow — has internal state (an input) that reveals the key bug
// ---------------------------------------------------------------------------

function TaskRow({
  task,
  keyMode,
}: {
  readonly task: Task;
  readonly keyMode: string;
}) {
  const inputId = useId();
  // Each row has its own local state. When keys are index-based and items
  // reorder, this state stays at the same DOM position instead of following
  // the task data — that's the bug.
  const [note, setNote] = useState("");

  return (
    <li className="key-task-row">
      <div className="key-task-row__info">
        <code className="chip">{keyMode}</code>
        <strong>{task.title}</strong>
        <span className="chip">{task.id}</span>
      </div>
      <div className="key-task-row__input">
        <label htmlFor={inputId} className="sr-only">
          Note for {task.title}
        </label>
        <input
          id={inputId}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type a note here..."
        />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// ResettableForm — demonstrates the key reset trick
// ---------------------------------------------------------------------------

function ResettableForm({ resetKey }: { readonly resetKey: number }) {
  const nameId = useId();
  const emailId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="sample-card">
      <p className="eyebrow">
        Form instance (key={resetKey})
      </p>
      <p className="section-copy">
        Changing the key unmounts this component and mounts a fresh instance.
        All local state (name, email) resets without an explicit clear handler.
      </p>
      <div className="key-form-fields">
        <div>
          <label htmlFor={nameId}>Name</label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor={emailId}>Email</label>
          <input
            id={emailId}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
      </div>
      <p className="section-copy">
        Current: name=&ldquo;{name || "(empty)"}&rdquo;,
        email=&ldquo;{email || "(empty)"}&rdquo;
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main sample
// ---------------------------------------------------------------------------

export default function KeyIdentitySample() {
  const [tasks, setTasks] = useState<readonly Task[]>(starterTasks);
  const [formResetKey, setFormResetKey] = useState(0);

  function shuffleTasks() {
    setTasks((prev) => {
      const shuffled = [...prev];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        const swap = shuffled[j];
        if (temp && swap) {
          shuffled[i] = swap;
          shuffled[j] = temp;
        }
      }
      return shuffled;
    });
  }

  function reverseTasks() {
    setTasks((prev) => [...prev].reverse());
  }

  function prependTask() {
    setTasks((prev) => [createTask(`New task #${nextTaskNumber}`), ...prev]);
  }

  return (
    <div className="key-identity-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Key identity and state preservation</h3>
      </div>

      <p className="section-copy">
        Type a note in each row, then shuffle or reverse. With{" "}
        <code>key=&#123;index&#125;</code>, the notes stay at their old
        positions instead of following the task. With{" "}
        <code>key=&#123;task.id&#125;</code>, notes follow the correct task.
      </p>

      <div className="button-row">
        <button type="button" className="primary-button" onClick={shuffleTasks}>
          Shuffle
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={reverseTasks}
        >
          Reverse
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={prependTask}
        >
          Prepend task
        </button>
      </div>

      <div className="key-lists-comparison">
        {/* BUG: key={index} — state follows DOM position, not data identity */}
        <div>
          <h4>
            key=&#123;index&#125; <span className="chip">Bug</span>
          </h4>
          <ul className="key-task-list">
            {tasks.map((task, index) => (
              <TaskRow key={index} task={task} keyMode={`index=${index}`} />
            ))}
          </ul>
        </div>

        {/* FIX: key={task.id} — state follows data identity */}
        <div>
          <h4>
            key=&#123;task.id&#125; <span className="chip">Fix</span>
          </h4>
          <ul className="key-task-list">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} keyMode={task.id} />
            ))}
          </ul>
        </div>
      </div>

      {/* Section 2: Key reset trick */}
      <div className="section-heading">
        <p className="eyebrow">Key reset trick</p>
        <h4>Force remount by changing key</h4>
      </div>

      <p className="section-copy">
        Fill in the form fields, then click &ldquo;Reset via key&rdquo;.
        The component unmounts and remounts with a new key, clearing all
        local state without an explicit reset handler.
      </p>

      <button
        type="button"
        className="primary-button"
        onClick={() => setFormResetKey((k) => k + 1)}
      >
        Reset via key (current: {formResetKey})
      </button>

      <ResettableForm key={formResetKey} resetKey={formResetKey} />
    </div>
  );
}
