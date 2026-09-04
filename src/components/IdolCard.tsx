import Image from "next/image";
import Link from "next/link";

interface IdolCardProps {
  id: string;
  photos: string[];
  price: number;
  heightFt: number;
  style?: string;
  shopName?: string;
}

export default function IdolCard({ id, photos, price, heightFt, style, shopName }: IdolCardProps) {
  const firstPhoto = photos[0] || "/placeholder-idol.jpg";

  return (
    <Link href={`/idol/${id}`} className="block">
      <article className="bg-card-surface rounded-xl ambient-shadow p-2.5 sm:p-3 transition-shadow duration-300 relative group cursor-pointer overflow-hidden">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-clay-base">
          <Image
            src={firstPhoto}
            alt={`${style || "Clay"} idol ${heightFt}ft`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Height badge */}
          <div className="absolute top-2 right-2 bg-card-surface/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-on-surface">
            {heightFt} ft
          </div>
          {/* Style tag */}
          {style && (
            <div className="absolute bottom-2 left-2 bg-card-surface/90 backdrop-blur-sm text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {style}
            </div>
          )}
          {/* Photo count */}
          {photos.length > 1 && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
              +{photos.length - 1}
            </div>
          )}
        </div>
        <div className="mt-2.5 px-1 pb-1">
          <h2 className="text-sm text-on-surface line-clamp-1 font-medium">
            {shopName || `${style || "Clay"} Idol`}
          </h2>
          <p className="font-display text-lg sm:text-xl font-bold text-primary mt-0.5 leading-tight">
            ₹{price.toLocaleString("en-IN")}
          </p>
        </div>
      </article>
    </Link>
  );
}

/* Skeleton loader */
export function IdolCardSkeleton() {
  return (
    <div className="bg-card-surface rounded-xl p-2">
      <div className="aspect-square skeleton rounded-lg" />
      <div className="mt-3 px-1 pb-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-6 w-1/2 rounded" />
      </div>
    </div>
  );
}
