export function Loading({ cards = 3 }: { cards?: number }) {
  return <div className="skeleton-stack">{Array.from({ length: cards }, (_, index) => <div className="skeleton" key={index} />)}</div>
}
