/**
 * The one memorable visual element of the app (per the design brief):
 * an animated pulse/vitals line, echoing the "clinical" + "pulse" +
 * "vital" naming already baked into the Tailwind color tokens. Traces a
 * heartbeat waveform once, then loops — a literal representation of a
 * system built around continuously tracked patient status.
 */
export default function PulseLine({ className = '' }) {
  return (
    <svg
      viewBox="0 0 600 120"
      className={`pulse-line w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Animated vitals waveform"
    >
      <path
        d="M0 60 H160 L185 60 L200 20 L220 100 L240 40 L255 60 H600"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
