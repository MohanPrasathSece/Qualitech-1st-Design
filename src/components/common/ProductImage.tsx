import React, { useState } from "react";

interface ProductImageProps {
  src?: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
  showText?: boolean;
}

/**
 * ProductImage component
 * Displays product image if available and valid.
 * If image is missing, empty, logo.png, or fails to load,
 * displays a clean, professional "Image Unavailable" placeholder.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = "h-full w-full object-contain",
  containerClassName = "",
  showText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Check if image is missing, empty, or fallback logo
  const isInvalid =
    !src ||
    src.trim() === "" ||
    src === "/logo.png" ||
    src.endsWith("/logo.png") ||
    imageError;

  if (isInvalid) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-slate-50/90 p-2 text-center select-none ${containerClassName}`}
        title={`${alt} (Image Unavailable)`}
      >
        <svg
          className="h-6 w-6 stroke-[1.5] text-slate-400 opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        {showText && (
          <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider text-slate-400 leading-tight">
            Image Unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ProductImage;
