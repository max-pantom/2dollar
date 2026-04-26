type SceneTapeProps = {
  position?: "top" | "bottom"
}

const checkerPattern = [true, true, true, false, true, true, false, true]

export function SceneTape({ position = "top" }: SceneTapeProps) {
  const date = formatDate(new Date())

  const left =
    position === "top"
      ? [
          { label: "2dd", value: "v0.4" },
          { label: "series", value: "$2-ish" },
          { label: "saturday", value: date },
        ]
      : [
          { label: "powered by", value: "porkbun + rdap" },
          { label: "renewal", value: "always shown" },
        ]

  const right =
    position === "top"
      ? [
          { label: "issue", value: "x39" },
          { label: "checks", value: "live" },
        ]
      : [
          { label: "ig", value: "@2dollardomain" },
          { label: "edition", value: "scene" },
        ]

  return (
    <div
      className={`scene-tape${position === "bottom" ? "scene-tape--bottom" : ""}`}
      aria-hidden="true"
    >
      <span className="flex items-center gap-3">
        {left.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="font-bold">{item.label}</span>
            <span className="opacity-70">{item.value}</span>
          </span>
        ))}
      </span>
      <span className="ml-auto flex items-center gap-3">
        {right.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="font-bold">{item.label}</span>
            <span className="opacity-70">{item.value}</span>
          </span>
        ))}
        <span className="scene-tape-checkers">
          {checkerPattern.map((on, index) => (
            <span
              key={index}
              className={on ? undefined : "is-empty"}
              aria-hidden="true"
            />
          ))}
        </span>
      </span>
    </div>
  )
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear() % 100).padStart(2, "0")
  return `${day}.${month}.${year}`
}
