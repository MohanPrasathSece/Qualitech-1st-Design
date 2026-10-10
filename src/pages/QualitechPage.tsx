import { ShopPage } from "./ShopPage";

interface QualitechPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function QualitechPage({ onNavigate }: QualitechPageProps) {
  return <ShopPage onNavigateHome={onNavigate} initialBrand="Qualitech" />;
}
