import Image from "next/image"
import Link from "next/link"
import { SITE_NAME } from "@/lib/site"

/** School logo: red house mark + "BEST SCHOOL OF REAL ESTATE" wordmark. */
export function BrandLogo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label={`${SITE_NAME} home`}>
      <Image
        src="/logo-mark.png"
        alt=""
        width={436}
        height={289}
        priority
        className={compact ? "h-7 w-auto" : "h-8 w-auto sm:h-9"}
      />
      <span
        className={`font-[family-name:var(--font-heading)] font-extrabold uppercase leading-none tracking-tight text-brand ${
          compact ? "text-sm" : "text-sm sm:text-base"
        }`}
      >
        {SITE_NAME}
      </span>
    </Link>
  )
}
