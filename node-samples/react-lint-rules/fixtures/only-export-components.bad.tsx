export function formatGreeting() {
  return 'Hello from a helper export'
}

export default function GreetingCard() {
  return <div>{formatGreeting()}</div>
}
