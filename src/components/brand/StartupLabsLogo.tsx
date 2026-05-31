import { BRANDEXPERTS_INNER, BRANDEXPERTS_VIEWBOX } from "@/assets/brandexperts-logo-inner";

type Props = {
  className?: string;
  title?: string;
};

/**
 * BrandExperts wordmark. Uses `currentColor` so it inherits the surrounding
 * text color — apply `text-foreground` (or any other text color utility) on
 * the parent to control light/dark appearance.
 *
 * The component name is kept as `StartupLabsLogo` for backwards compatibility
 * with existing import sites.
 */
export function StartupLabsLogo({ className, title = "BrandExperts" }: Props) {
  return (
    <svg
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={BRANDEXPERTS_VIEWBOX}
      className={className}
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: `<title>${title}</title>${BRANDEXPERTS_INNER}` }}
    />
  );
}
