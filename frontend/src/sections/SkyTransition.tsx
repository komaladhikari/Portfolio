type StarPoint = { x: number; y: number; radius?: number; delay: number }

type Constellation = {
  name: string
  stars: StarPoint[]
  links: [number, number][]
}

const constellations: Constellation[] = [
  {
    name: 'The Lantern',
    stars: [
      { x: 92, y: 88, radius: 2.6, delay: 0.2 }, { x: 156, y: 120, delay: 1.4 },
      { x: 222, y: 82, radius: 2.2, delay: 0.8 }, { x: 247, y: 158, delay: 2.1 },
      { x: 172, y: 194, radius: 2.4, delay: 0.5 }, { x: 112, y: 166, delay: 1.8 },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]],
  },
  {
    name: 'The Wanderer',
    stars: [
      { x: 474, y: 58, delay: 1.1 }, { x: 532, y: 93, radius: 2.5, delay: 0.3 },
      { x: 591, y: 75, delay: 2.3 }, { x: 637, y: 132, radius: 2.2, delay: 1.6 },
      { x: 696, y: 103, delay: 0.7 },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'The Little Kite',
    stars: [
      { x: 1048, y: 80, radius: 2.4, delay: 1.7 }, { x: 1113, y: 48, delay: 0.6 },
      { x: 1178, y: 103, radius: 2.7, delay: 2.5 }, { x: 1119, y: 157, delay: 1.2 },
      { x: 1160, y: 205, delay: 0.1 },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4]],
  },
  {
    name: 'The Crescent Path',
    stars: [
      { x: 231, y: 314, delay: 0.9 }, { x: 294, y: 278, radius: 2.4, delay: 2 },
      { x: 362, y: 297, delay: 0.4 }, { x: 398, y: 350, radius: 2.2, delay: 1.5 },
      { x: 454, y: 371, delay: 2.6 },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'The Dreamer',
    stars: [
      { x: 920, y: 278, delay: 2.2 }, { x: 982, y: 318, radius: 2.6, delay: 0.5 },
      { x: 1055, y: 289, delay: 1.3 }, { x: 1122, y: 329, radius: 2.3, delay: 0 },
      { x: 1194, y: 300, delay: 1.9 }, { x: 1262, y: 346, delay: 0.8 },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
]

export function SkyTransition() {
  return (
    <div className="sky-transition" aria-hidden="true">
      <svg className="constellation-map" viewBox="0 0 1360 430" preserveAspectRatio="xMidYMid slice">
        {constellations.map((constellation) => (
          <g key={constellation.name}>
            {constellation.links.map(([from, to]) => (
              <line
                className="constellation-line"
                key={`${from}-${to}`}
                x1={constellation.stars[from].x}
                y1={constellation.stars[from].y}
                x2={constellation.stars[to].x}
                y2={constellation.stars[to].y}
              />
            ))}
            {constellation.stars.map((star, index) => (
              <circle
                className="constellation-star"
                key={`${constellation.name}-${index}`}
                cx={star.x}
                cy={star.y}
                r={star.radius ?? 1.8}
                style={{ animationDelay: `${star.delay}s` }}
              />
            ))}
          </g>
        ))}
      </svg>
      <span>The sky grows quieter after dusk</span>
    </div>
  )
}
