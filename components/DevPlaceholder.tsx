'use client'

import Image from 'next/image'

export default function DevPlaceholder() {
  return (
    <div className="content-enter mt-6 mb-10 flex flex-col items-center">
      <Image
        src="/dev-working.jpg"
        alt="개발 진행 중"
        width={420}
        height={280}
        className="h-auto w-full max-w-[420px]"
        priority
      />
      <p className="mt-4 text-center text-base font-medium text-ink">
        개발자가 열심히 개발중입니다.
      </p>
      <p className="mt-1 text-center text-sm text-ink/60">
        곧 더 멋진 기능으로 돌아옵니다 :)
      </p>
    </div>
  )
}
