import logoSvg from "@/assets/brandexperts-logo.svg?raw";

type Props = {
  className?: string;
  title?: string;
};

/**
 * BrandExperts wordmark. The SVG is authored with `fill="currentColor"` so it
 * inherits whatever text color the surrounding container sets — light/dark
 * theming is handled by the parent applying `text-foreground` (or any other
 * text-color utility).
 *
 * The component name is kept as `StartupLabsLogo` for backwards compatibility
 * with existing import sites.
 */
export function StartupLabsLogo({ className, title = "BrandExperts" }: Props) {
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={"inline-block " + (className ?? "")}
      // SVG content is a static, trusted build-time asset.
      dangerouslySetInnerHTML={{ __html: logoSvg }}
      style={{ lineHeight: 0 }}
    />
  );
}
