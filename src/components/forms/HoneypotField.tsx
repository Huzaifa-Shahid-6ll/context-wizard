// Bot detection field - bots will fill this, humans won't see it

export function HoneypotField() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        opacity: 0,
        pointerEvents: 'none',
      }}
      tabIndex={-1}
      aria-hidden="true"
    >
      <label htmlFor="website_url">Website (leave blank)</label>
      <input
        type="text"
        id="website_url"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

