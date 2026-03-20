import { useState } from 'react'

// Recursive types let a type reference itself, which is essential for modeling
// tree-shaped data like org charts, file systems, comment threads, or nested configs.

type OrgNodeId = `org-${number}`
type OrgRole = 'director' | 'manager' | 'lead' | 'engineer'

// A recursive interface: each OrgNode can contain an array of OrgNode children.
// TypeScript resolves this self-reference lazily, so the recursion terminates at runtime
// when the children array is empty.
interface OrgNode {
  readonly id: OrgNodeId
  readonly name: string
  readonly role: OrgRole
  readonly budget: number
  readonly children: readonly OrgNode[]
}

// A recursive type alias using a union: a config value is either a primitive
// or a nested record of more config values. This pattern appears in JSON schemas,
// settings trees, and any deeply nested configuration structure.
type ConfigValue = string | number | boolean | readonly ConfigValue[] | { readonly [key: string]: ConfigValue }

// DeepReadonly makes every property readonly at every nesting level.
// Without recursion, you would only freeze the top-level properties.
type DeepReadonly<T> = T extends readonly (infer Item)[]
  ? readonly DeepReadonly<Item>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

// FlattenTree extracts the node type from a recursive tree structure.
// Since OrgNode is already a concrete recursive interface, the flattened type is OrgNode itself.
// The key insight: a recursive interface already describes all levels of the tree.
type FlattenedOrgNode = OrgNode

// DeepKeyPaths builds a union of dot-separated paths through a nested object.
// This enables type-safe access to deeply nested fields without runtime reflection.
type DeepKeyPaths<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${Prefix}${K}` | DeepKeyPaths<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never

// --- Static data ---

const orgTree: OrgNode = {
  id: 'org-1',
  name: 'Platform division',
  role: 'director',
  budget: 2_400_000,
  children: [
    {
      id: 'org-2',
      name: 'Frontend systems',
      role: 'manager',
      budget: 900_000,
      children: [
        {
          id: 'org-4',
          name: 'React framework team',
          role: 'lead',
          budget: 350_000,
          children: [
            { id: 'org-7', name: 'Component engineer', role: 'engineer', budget: 0, children: [] },
            { id: 'org-8', name: 'Performance engineer', role: 'engineer', budget: 0, children: [] },
          ],
        },
        {
          id: 'org-5',
          name: 'Design systems team',
          role: 'lead',
          budget: 280_000,
          children: [
            { id: 'org-9', name: 'Token engineer', role: 'engineer', budget: 0, children: [] },
          ],
        },
      ],
    },
    {
      id: 'org-3',
      name: 'Infrastructure',
      role: 'manager',
      budget: 1_100_000,
      children: [
        {
          id: 'org-6',
          name: 'Observability team',
          role: 'lead',
          budget: 420_000,
          children: [
            { id: 'org-10', name: 'Telemetry engineer', role: 'engineer', budget: 0, children: [] },
          ],
        },
      ],
    },
  ],
}

// A nested config structure to demonstrate the recursive ConfigValue type.
const deployConfig: DeepReadonly<{ readonly [key: string]: ConfigValue }> = {
  environment: 'production',
  retryCount: 3,
  features: {
    darkMode: true,
    experimentalApi: false,
    rollout: {
      percentage: 50,
      regions: ['us-east', 'eu-west'],
    },
  },
  alerts: {
    enabled: true,
    thresholds: {
      cpu: 85,
      memory: 90,
    },
  },
}

const roleLabels: Record<OrgRole, string> = {
  director: 'Director',
  manager: 'Manager',
  lead: 'Lead',
  engineer: 'Engineer',
}

// --- Recursive runtime helpers ---

// collectAllNodes flattens the tree into a list — the runtime equivalent of FlattenChildren.
function collectAllNodes(node: OrgNode): readonly OrgNode[] {
  return [node, ...node.children.flatMap(collectAllNodes)]
}

// countDescendants is a recursive function that mirrors the recursive type structure.
function countDescendants(node: OrgNode): number {
  return node.children.length + node.children.reduce((sum, child) => sum + countDescendants(child), 0)
}

// totalBudget recursively sums the budget at every level of the tree.
function totalBudget(node: OrgNode): number {
  return node.budget + node.children.reduce((sum, child) => sum + totalBudget(child), 0)
}

// renderConfigValue recursively renders the nested config, showing how the recursive
// ConfigValue type maps to a recursive rendering function.
function renderConfigValue(value: ConfigValue, depth: number): string {
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.map((item) => renderConfigValue(item as ConfigValue, depth + 1)).join(', ')}]`

  const indent = '  '.repeat(depth + 1)
  const closingIndent = '  '.repeat(depth)
  const entries = Object.entries(value as Record<string, ConfigValue>)
    .map(([key, val]) => `${indent}${key}: ${renderConfigValue(val, depth + 1)}`)
    .join('\n')
  return `{\n${entries}\n${closingIndent}}`
}

// Collect all dot-paths from a config object at runtime.
// This mirrors the DeepKeyPaths type but works with runtime values.
function collectConfigPaths(obj: Record<string, ConfigValue>, prefix = ''): readonly string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return [path, ...collectConfigPaths(value as Record<string, ConfigValue>, path)]
    }
    return [path]
  })
}

// --- Type-level demonstrations that appear in the UI ---

// These type assertions verify the recursive types at compile time.
// If any assertion fails, the project will not type-check.
const _assertFlattenedHasRoot: FlattenedOrgNode = orgTree
void _assertFlattenedHasRoot
const _assertDeepReadonly: DeepReadonly<{ a: { b: string[] } }> = { a: { b: ['test'] } } as const
void _assertDeepReadonly

// DeepKeyPaths applied to the deploy config shape produces a union of all valid dot-paths.
type DeployConfigShape = typeof deployConfig
type _ValidDeployPaths = DeepKeyPaths<DeployConfigShape>

// A sample of valid paths — these would cause a type error if they did not match.
const _samplePaths: _ValidDeployPaths[] = [
  'environment',
  'features.darkMode',
  'features.rollout.percentage',
  'alerts.thresholds.cpu',
]
void _samplePaths

function OrgTreeView({ node, depth }: { readonly node: OrgNode; readonly depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children.length > 0
  const descendants = countDescendants(node)
  const subtotal = totalBudget(node)

  return (
    <div className="recursive-tree-node" style={{ marginLeft: `${depth * 1.2}rem` }}>
      <div className="sample-card recursive-node-card">
        <div className="recursive-node-card__header">
          {hasChildren ? (
            <button
              type="button"
              className="recursive-toggle"
              onClick={() => { setExpanded((prev) => !prev) }}
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`}
            >
              {expanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="recursive-toggle recursive-toggle--leaf">●</span>
          )}
          <strong>{node.name}</strong>
          <span className="chip">{roleLabels[node.role]}</span>
        </div>
        <div className="sample-card__meta">
          <span>{node.id}</span>
          {hasChildren && <span>{descendants} report{descendants === 1 ? '' : 's'}</span>}
          {subtotal > 0 && <span>${subtotal.toLocaleString()}</span>}
        </div>
      </div>
      {expanded && hasChildren && (
        <div role="group" aria-label={`${node.name} reports`}>
          {node.children.map((child) => (
            <OrgTreeView key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RecursiveTypesSample() {
  const allNodes = collectAllNodes(orgTree)
  const configPaths = collectConfigPaths(deployConfig as Record<string, ConfigValue>)

  return (
    <section className="sample-section recursive-types-sample">
      <h3>Recursive types and tree-shaped data</h3>

      {/* Part 1: Recursive interface — OrgNode references itself through children. */}
      <div className="recursive-section">
        <p className="eyebrow">Recursive interface — OrgNode tree</p>
        <p className="section-copy">
          Each OrgNode contains an array of OrgNode children. TypeScript resolves this self-reference
          lazily at the type level, which lets you model arbitrarily deep hierarchies with one interface.
        </p>
        <OrgTreeView node={orgTree} depth={0} />
        <div className="sample-card recursive-summary-card">
          <div className="sample-card__meta">
            <span>Total nodes: {allNodes.length}</span>
            <span>Total budget: ${totalBudget(orgTree).toLocaleString()}</span>
            <span>Max depth: {Math.max(...allNodes.map((n) => {
              let current: OrgNode = orgTree
              const stack: OrgNode[] = [current]
              const depthMap = new Map<OrgNodeId, number>([[current.id, 0]])
              while (stack.length > 0) {
                current = stack.pop()!
                const d = depthMap.get(current.id) ?? 0
                for (const child of current.children) {
                  depthMap.set(child.id, d + 1)
                  stack.push(child)
                }
              }
              return depthMap.get(n.id) ?? 0
            }))}</span>
          </div>
        </div>
      </div>

      {/* Part 2: Recursive type alias — ConfigValue can nest arbitrarily. */}
      <div className="recursive-section">
        <p className="eyebrow">Recursive type alias — nested config</p>
        <p className="section-copy">
          A ConfigValue is a union of primitives, arrays of ConfigValue, or records of ConfigValue.
          This pattern handles any JSON-like structure without losing type safety.
        </p>
        <pre className="recursive-config-preview">
          {renderConfigValue(deployConfig as Record<string, ConfigValue>, 0)}
        </pre>
      </div>

      {/* Part 3: DeepKeyPaths — compile-time dot-path extraction. */}
      <div className="recursive-section">
        <p className="eyebrow">DeepKeyPaths — type-safe dot paths</p>
        <p className="section-copy">
          DeepKeyPaths recursively builds a union of every valid dot-separated path through an object type.
          The runtime collectConfigPaths function mirrors this logic to show all valid paths.
        </p>
        <ul className="summary-list">
          {configPaths.map((path) => (
            <li key={path}><code>{path}</code></li>
          ))}
        </ul>
      </div>

      {/* Part 4: Compile-time type utilities — DeepReadonly, FlattenChildren. */}
      <div className="recursive-section">
        <p className="eyebrow">Compile-time recursive utilities</p>
        <dl className="recursive-type-list">
          <div>
            <dt><code>DeepReadonly&lt;T&gt;</code></dt>
            <dd>Recursively applies <code>readonly</code> at every nesting level. Without recursion, only top-level properties are frozen.</dd>
          </div>
          <div>
            <dt><code>FlattenedOrgNode</code></dt>
            <dd>With a recursive interface, the flattened type is the interface itself — all levels share one shape. Runtime flattening uses a recursive collectAllNodes function.</dd>
          </div>
          <div>
            <dt><code>DeepKeyPaths&lt;T&gt;</code></dt>
            <dd>Produces a union of dot-separated string paths, enabling type-safe deep property access patterns.</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
