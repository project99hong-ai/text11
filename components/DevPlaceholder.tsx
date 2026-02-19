'use client'

const SUPPORT_URL = 'https://buymeacoffee.com/'

export default function DevPlaceholder() {
  return (
    <div className="content-enter mb-10 min-h-[70vh] -translate-y-10 flex flex-col items-center justify-center">
      <img
        src="/dev-meme-REAL.png"
        alt="개발 진행 중"
        width={420}
        height={280}
        className="h-auto w-full max-w-[420px]"
      />
      <p className="mt-4 text-center text-base font-medium text-ink">
        개발자가 열심히 개발중입니다.
      </p>
      <p className="mt-1 text-center text-sm text-ink/60">
        곧 더 멋진 기능으로 돌아옵니다 :)
      </p>
      <button
        type="button"
        className="mt-4 text-sm text-ink/80 hover:underline"
      >
        ☕ 커피 한잔 사주기
      </button>
      <p className="mt-1 text-xs text-ink/50">
        (커피는 개발자에게, 기능은 당신에게)
      </p>
    </div>
  )
}
