/** Wordmark GAO FOOD — seul endroit où la police display est autorisée. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      GAO<span className="text-primary"> FOOD</span>
    </span>
  );
}
