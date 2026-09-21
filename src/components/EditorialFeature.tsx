import { Link } from 'react-router-dom'

interface EditorialFeatureProps {
  imageMobile: string
  imageTablet: string
  imageDesktop: string
  title: string
  subtitle?: string
  buttonLabel?: string
  enabled?: boolean
  to: string
}

function EditorialFeature({
  imageMobile,
  imageTablet,
  imageDesktop,
  title,
  subtitle,
  buttonLabel = '컬렉션 보기',
  enabled = true,
  to,
}: EditorialFeatureProps) {
  const fallbackImage = imageDesktop || imageTablet || imageMobile
  if (!enabled || !fallbackImage) return null

  return (
    <section className="mt-64 w-full md:mt-80 lg:mt-120">
      <article className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted md:aspect-[4/3] lg:h-[600px] lg:aspect-auto xl:h-[640px]">
        <picture>
          <source media="(min-width: 1024px)" srcSet={imageDesktop || fallbackImage} />
          <source media="(min-width: 768px)" srcSet={imageTablet || fallbackImage} />
          <img
            src={imageMobile || fallbackImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start px-20 pb-32 text-surface md:px-32 md:pb-48 lg:px-80 lg:pb-64 xl:px-140 2xl:px-200">
          <h2 className="font-display whitespace-pre-line text-[28px] font-medium leading-[1.15] tracking-[0.025em] text-surface drop-shadow-md md:text-[34px] lg:text-[40px]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-12 max-w-[560px] whitespace-pre-line text-[16px] leading-[1.6] text-surface drop-shadow">
              {subtitle}
            </p>
          )}
          <Link
            to={to}
            className="mt-20 inline-flex h-44 items-center justify-center rounded-sm border border-surface px-24 text-[14px] font-medium text-surface no-underline transition-colors hover:bg-surface hover:text-primary active:scale-[0.98] md:mt-24"
          >
            {buttonLabel}
          </Link>
        </div>
      </article>
    </section>
  )
}

export default EditorialFeature
