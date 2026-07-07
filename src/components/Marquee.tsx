const ITEMS = [
  'Applied LLM Systems',
  'Agentic Workflows',
  'RAG Architecture',
  'Forward Deployment',
  'Solution Architecture',
  'Cloud & DevOps',
  'Banking-Grade Delivery',
  'Voice AI',
]

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  )
}
