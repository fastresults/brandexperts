type Props = {
  className?: string;
  title?: string;
};

/**
 * Compact BrandExperts mark — one of the star/burst glyphs from the full
 * wordmark, isolated in a square viewBox for collapsed sidebars and
 * favicon-sized slots. Uses `currentColor` so it adapts to the active theme.
 */
export function StartupLabsMark({ className, title = "BrandExperts" }: Props) {
  return (
    <svg
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="375 -3 78 70"
      className={className}
      fill="currentColor"
    >
      <title>{title}</title>
      <path d="M413.58,23.1h23.68c.24,0,.44.19.44.43,0,.14-.07.28-.18.36l-19.15,13.93c-.15.11-.22.3-.16.48l7.32,22.53c.07.23-.07.47-.3.54-.13.04-.26.01-.37-.06l-19.17-13.9c-.15-.11-.36-.11-.52,0l-19.17,13.9c-.2.14-.47.09-.61-.11-.07-.11-.1-.24-.06-.37l7.32-22.53c.05-.18-.01-.37-.16-.48l-19.15-13.93c-.2-.14-.24-.41-.1-.61.08-.12.22-.18.36-.18h23.68c.19,0,.35-.12.41-.3l7.33-22.52c.08-.23.33-.34.56-.26.12.04.21.14.26.26l7.33,22.52c.06.18.22.3.41.3Z" />
    </svg>
  );
}
