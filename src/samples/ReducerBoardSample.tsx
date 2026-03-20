// Reducer-driven task board
// -------------------------
// This sample demonstrates useReducer with a domain-oriented action pattern.
// Instead of scattering state mutations across event handlers, every transition
// goes through one reducer function that owns the full state shape.
// Key patterns: discriminated union actions, exhaustive switch, lazy initializer.

import { useId, useReducer, useState, type FormEvent } from 'react'

type BoardLane = 'Backlog' | 'Active' | 'Done'
type BoardFilter = BoardLane | 'All'
type BoardTaskId = `board-task-${number}`
type BoardPriority = 'Normal' | 'High'

interface BoardTask {
  readonly id: BoardTaskId
  readonly title: string
  readonly lane: BoardLane
  readonly priority: BoardPriority
}

interface BoardState {
  readonly filter: BoardFilter
  readonly tasks: readonly BoardTask[]
  readonly lastAction: string
}

// Each action variant carries just enough data for its case.
// TypeScript narrows `action` inside each switch branch through the discriminated `type` field.
type BoardAction =
  | { readonly type: 'add'; readonly task: BoardTask }
  | { readonly type: 'move'; readonly taskId: BoardTaskId; readonly lane: BoardLane }
  | { readonly type: 'toggle-priority'; readonly taskId: BoardTaskId }
  | { readonly type: 'set-filter'; readonly filter: BoardFilter }
  | { readonly type: 'reset' }

const boardLanes = ['Backlog', 'Active', 'Done'] as const satisfies readonly BoardLane[]

const starterBoardTasks = [
  {
    id: 'board-task-1',
    title: 'Normalize reducer actions around domain intent',
    lane: 'Backlog',
    priority: 'High',
  },
  {
    id: 'board-task-2',
    title: 'Move lane transitions behind dispatch calls',
    lane: 'Active',
    priority: 'Normal',
  },
  {
    id: 'board-task-3',
    title: 'Show last reducer action in the UI',
    lane: 'Done',
    priority: 'Normal',
  },
] as const satisfies readonly BoardTask[]

let nextBoardTaskNumber = starterBoardTasks.length + 1

function createBoardState(): BoardState {
  return {
    filter: 'All',
    tasks: starterBoardTasks,
    lastAction: 'Board seeded through the reducer initializer.',
  }
}

// useReducer shines when handlers dispatch intent and the reducer owns every state transition.
// Each case returns the full next state including a `lastAction` string so the UI can
// show which transition just happened without threading extra state through event handlers.
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
        lastAction: `Added "${action.task.title}" to ${action.task.lane}.`,
      }
    case 'move':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, lane: action.lane } : task,
        ),
        lastAction: `Moved ${action.taskId} to ${action.lane}.`,
      }
    case 'toggle-priority':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                priority: task.priority === 'High' ? 'Normal' : 'High',
              }
            : task,
        ),
        lastAction: `Toggled priority for ${action.taskId}.`,
      }
    case 'set-filter':
      return {
        ...state,
        filter: action.filter,
        lastAction: `Filtered board to ${action.filter}.`,
      }
    case 'reset':
      return {
        ...createBoardState(),
        lastAction: 'Reset reducer state to its initializer output.',
      }
    default:
      // assertNever guarantees exhaustiveness at compile time: if a new action variant
      // is added to BoardAction but not handled above, TypeScript will report a type error
      // here because `action` won't narrow to `never`.
      return assertNever(action)
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled reducer action: ${JSON.stringify(value)}`)
}

function createBoardTask(title: string): BoardTask {
  return {
    // A simple incrementing id keeps keys stable without depending on wall-clock timing.
    id: `board-task-${nextBoardTaskNumber++}`,
    title,
    lane: 'Backlog',
    priority: 'Normal',
  }
}

function tasksForLane(tasks: readonly BoardTask[], lane: BoardLane) {
  return tasks.filter((task) => task.lane === lane)
}

export default function ReducerBoardSample() {
  const formId = useId()
  const [draftTitle, setDraftTitle] = useState('')
  // Lazy initialization keeps the initial board construction out of the render path.
  // The third argument (createBoardState) runs once on mount instead of every render,
  // which avoids recalculating the starter tasks on each update.
  const [state, dispatch] = useReducer(boardReducer, undefined, createBoardState)

  const visibleLanes = boardLanes.filter((lane) => state.filter === 'All' || state.filter === lane)
  const highPriorityCount = state.tasks.filter((task) => task.priority === 'High').length

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = draftTitle.trim()

    if (!title) {
      return
    }

    dispatch({
      type: 'add',
      task: createBoardTask(title),
    })
    setDraftTitle('')
  }

  return (
    <div className="reducer-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Reducer-driven task board</h3>
      </div>

      <p className="section-copy">
        This sample keeps every task transition inside one reducer so the UI only dispatches
        intent. It is a better fit for <code>useReducer</code> than a trivial counter.
      </p>

      <form className="reducer-add-form" onSubmit={handleAddTask}>
        <label htmlFor={`${formId}-task`} className="sr-only">
          New reducer task
        </label>
        <input
          id={`${formId}-task`}
          type="text"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          placeholder="Add a reducer-managed task"
        />
        <button type="submit" className="primary-button">
          Add task
        </button>
      </form>

      <div className="reducer-toolbar">
        <div className="filter-row">
          {(['All', ...boardLanes] as const).map((filterOption) => (
            <button
              key={filterOption}
              type="button"
              className={`filter-button ${state.filter === filterOption ? 'is-selected' : ''}`}
              onClick={() =>
                dispatch({
                  type: 'set-filter',
                  filter: filterOption,
                })
              }
            >
              {filterOption}
            </button>
          ))}
        </div>

        <button type="button" className="secondary-button" onClick={() => dispatch({ type: 'reset' })}>
          Reset board
        </button>
      </div>

      {/* Derived UI metrics stay outside the reducer so actions only describe actual state changes. */}
      <div className="reducer-summary">
        <article className="reducer-stat">
          <span>Total tasks</span>
          <strong>{state.tasks.length}</strong>
        </article>
        <article className="reducer-stat">
          <span>High priority</span>
          <strong>{highPriorityCount}</strong>
        </article>
        <article className="reducer-stat">
          <span>Last action</span>
          <strong>{state.lastAction}</strong>
        </article>
      </div>

      <div className="reducer-board">
        {visibleLanes.map((lane) => {
          const laneTasks = tasksForLane(state.tasks, lane)

          return (
            <section key={lane} className="reducer-column">
              <header className="reducer-column__header">
                <h4>{lane}</h4>
                <span>{laneTasks.length}</span>
              </header>

              <div className="reducer-column__list">
                {laneTasks.map((task) => (
                  <article key={task.id} className="reducer-card">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.priority} priority</p>
                    </div>

                    <div className="reducer-card__actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          dispatch({
                            type: 'toggle-priority',
                            taskId: task.id,
                          })
                        }
                      >
                        Toggle priority
                      </button>

                      <div className="reducer-card__lane-actions">
                        {boardLanes
                          .filter((targetLane) => targetLane !== lane)
                          .map((targetLane) => (
                            <button
                              key={targetLane}
                              type="button"
                              className="filter-button"
                              onClick={() =>
                                dispatch({
                                  type: 'move',
                                  taskId: task.id,
                                  lane: targetLane,
                                })
                              }
                            >
                              Move to {targetLane}
                            </button>
                          ))}
                      </div>
                    </div>
                  </article>
                ))}

                {!laneTasks.length ? (
                  <div className="empty-state">
                    <strong>No tasks in {lane}.</strong>
                    <p>Dispatch a move action or change the current filter.</p>
                  </div>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
