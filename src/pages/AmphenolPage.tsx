import { ShopPage } from "./ShopPage";

interface AmphenolPageProps {
  onNavigate: (href?: string, isPage?: boolean) => void;
}

export function AmphenolPage({ onNavigate }: AmphenolPageProps) {
  return <ShopPage onNavigateHome={onNavigate} initialBrand="Amphenol" />;
}
