export function Marquee({ text }: { text: string }) {
  const items = Array(8).fill(text)
  return (
    <div className="relative overflow-hidden border-y border-white/7 py-4 bg-[#0A0A0A]">
      <div className="flex gap-0 animate-marquee whitespace-nowrap will-change-transform">
        {items.map((t, i) => (
          <span key={i} className="font-label text-xs tracking-[0.3em] text-[#555555] uppercase px-8">
            {t}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((t, i) => (
          <span key={`b${i}`} aria-hidden className="font-label text-xs tracking-[0.3em] text-[#555555] uppercase px-8">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
