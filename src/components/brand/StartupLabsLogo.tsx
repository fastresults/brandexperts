import brandexpertsLogoUrl from "@/assets/brandexperts-header.svg";

type Props = {
  className?: string;
  title?: string;
};

/**
 * BrandExperts wordmark. Renders the brand-colored SVG logo as an <img>.
 * The component name is kept as `StartupLabsLogo` for backwards compatibility.
 */
export function StartupLabsLogo({ className, title = "BrandExperts" }: Props) {
  return <img src={brandexpertsLogoUrl} alt={title} className={className} />;
}
