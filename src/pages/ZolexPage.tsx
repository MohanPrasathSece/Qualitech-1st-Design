import { ShopPage } from "./ShopPage";

interface ZolexPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function ZolexPage({ onNavigate }: ZolexPageProps) {
  return <ShopPage onNavigateHome={onNavigate} initialBrand="Zolex" />;
}
