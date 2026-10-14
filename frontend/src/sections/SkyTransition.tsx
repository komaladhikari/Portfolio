const transitionStars = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 41 + 5) % 96}%`,
  top: `${(index * 67 + 11) % 92}%`,
  delay: `${(index % 7) * 0.35}s`,
}))

export function SkyTransition() {
  return (
    <div className="sky-transition" aria-hidden="true">
      {transitionStars.map((star, index) => (
        <i key={index} style={{ left: star.left, top: star.top, animationDelay: star.delay }} />
      ))}
      <span>The sky grows quieter after dusk</span>
    </div>
  )
}
