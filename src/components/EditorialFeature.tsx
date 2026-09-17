import { Link } from 'react-router-dom'

interface EditorialFeatureProps {
  image: string
  title: string
  to: string
}

function EditorialFeature({ image, title, to }: EditorialFeatureProps) {
  return (
    <section className="mt-64 w-full md:mt-96 lg:mt-128">
      <article className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted md:aspect-[4/3] lg:h-[600px] lg:aspect-auto xl:h-[640px]">
        {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start px-20 pb-32 text-surface md:px-32 md:pb-48 lg:px-80 lg:pb-64 xl:px-140 2xl:px-200">
          <h2 className="font-display text-[28px] font-medium leading-[1.15] tracking-[0.025em] text-surface drop-shadow-md md:text-[34px] lg:text-[40px]">
            {title}
          </h2>
          <Link
            to={to}
            className="mt-24 inline-flex h-44 items-center justify-center rounded-sm border border-surface px-24 text-[14px] font-medium text-surface no-underline transition-colors hover:bg-surface hover:text-primary active:scale-[0.98]"
          >
            컬렉션 보기
          </Link>
        </div>
      </article>
    </section>
  )
}

export default EditorialFeature
