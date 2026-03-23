export function ComplexDashboard({ value }: { readonly value: number }) {
  return <section>{value}</section>
}

export function simpleDisplay({ value }: { readonly value: string }) {
  return <p>{value}</p>
}
