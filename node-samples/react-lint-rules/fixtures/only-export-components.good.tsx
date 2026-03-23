export type GreetingCardProps = {
  readonly title: string
}

export default function GreetingCard({ title }: GreetingCardProps) {
  return <div>{title}</div>
}
