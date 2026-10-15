export function GrantedMessage({ onClose }: { onClose: () => void }) {
  return (
    <aside className="granted-message" aria-live="polite">
      <button onClick={onClose} aria-label="Dismiss">×</button>
      <strong>Granted. ✦</strong>
      <p>Your wish has found its place among the stars.</p>
      <a href="#shared-sky">Visit the Shared Sky →</a>
    </aside>
  )
}
