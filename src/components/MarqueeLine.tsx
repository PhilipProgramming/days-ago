type MarqueeLineProps = {
  text: string
  align: "start" | "end"
}

export function MarqueeLine({ text, align }: MarqueeLineProps) {
  return (
    <div className={`marquee-anchor marquee-anchor-${align}`}>
      <p className="marquee">{text}</p>
    </div>
  )
}
