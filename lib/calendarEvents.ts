export type Layer = 'expo' | 'hack' | 'stock'

export type CalEvent = {
  id: string
  layer: Layer
  title: string
  date: string
  endDate?: string
  tag?: string
  importance?: number
}

export const CAL_EVENTS: CalEvent[] = [
  {
    id: 'zkd-openai-primer-deadline',
    layer: 'hack',
    title: '조코딩 X OpenAI X 프라이머 AI 해커톤 과제 제출 마감 23:59',
    date: '2026-02-20',
    tag: '마감',
    importance: 5,
  },
  {
    id: 'zkd-openai-primer-prelim',
    layer: 'hack',
    title: '조코딩 X OpenAI X 프라이머 AI 해커톤 예선 심사',
    date: '2026-02-21',
    endDate: '2026-03-01',
    importance: 3,
  },
  {
    id: 'zkd-openai-primer-announce',
    layer: 'hack',
    title: '조코딩 X OpenAI X 프라이머 AI 해커톤 예선 결과 발표',
    date: '2026-03-02',
    tag: '발표',
    importance: 5,
  },
  {
    id: 'zkd-openai-primer-finals',
    layer: 'hack',
    title: '조코딩 X OpenAI X 프라이머 AI 해커톤 오프라인 본선·시상식',
    date: '2026-03-07',
    tag: '본선',
    importance: 5,
  },
  {
    id: 'semicon-korea-2026',
    layer: 'expo',
    title: '세미콘 코리아',
    date: '2026-02-11',
    endDate: '2026-02-13',
    importance: 3,
  },
  {
    id: 'golf-expo-2026',
    layer: 'expo',
    title: '골프 엑스포',
    date: '2026-02-20',
    endDate: '2026-02-22',
    importance: 2,
  },
  {
    id: 'sldf-2026',
    layer: 'expo',
    title: '서울리빙디자인페어',
    date: '2026-02-25',
    endDate: '2026-03-01',
    importance: 4,
  },
  {
    id: 'aw-2026',
    layer: 'expo',
    title: '스마트공장·자동화산업전',
    date: '2026-03-04',
    endDate: '2026-03-06',
    importance: 3,
  },
  {
    id: 'krx-seollal-1',
    layer: 'stock',
    title: 'KRX 설 연휴 휴장',
    date: '2026-02-16',
    tag: '휴장',
    importance: 5,
  },
  {
    id: 'krx-seollal-2',
    layer: 'stock',
    title: 'KRX 설 연휴 휴장',
    date: '2026-02-17',
    tag: '휴장',
    importance: 5,
  },
  {
    id: 'krx-seollal-3',
    layer: 'stock',
    title: 'KRX 설 연휴 휴장',
    date: '2026-02-18',
    tag: '휴장',
    importance: 5,
  },
  {
    id: 'krx-mar1-holiday',
    layer: 'stock',
    title: '3·1절 대체공휴일(증시 휴장)',
    date: '2026-03-02',
    tag: '휴장',
    importance: 5,
  },
  {
    id: 'krx-quad-witching',
    layer: 'stock',
    title: '선물·옵션 동시만기(네 마녀의 날)',
    date: '2026-03-12',
    tag: '동시만기',
    importance: 4,
  },
  {
    id: 'krx-quad-witching-note',
    layer: 'stock',
    title: '장 마감 직전 변동성 확대 유의',
    date: '2026-03-12',
    tag: '유의',
    importance: 2,
  },
  {
    id: 'manho-steel-halt',
    layer: 'stock',
    title: '만호제강 주식분할 거래정지',
    date: '2026-02-20',
    endDate: '2026-03-06',
    tag: '거래정지',
    importance: 4,
  },
  {
    id: 'abpro-bio-halt',
    layer: 'stock',
    title: '에이비프로바이오 자본감소 거래정지 시작',
    date: '2026-02-20',
    tag: '거래정지',
    importance: 4,
  },
  {
    id: 'customs-trade-early-feb',
    layer: 'stock',
    title: '관세청 수출입 현황(2월 1~10일) 발표',
    date: '2026-02-11',
    tag: '수출입',
    importance: 3,
  },
  {
    id: 'fomc-meeting',
    layer: 'stock',
    title: '미국 FOMC 회의',
    date: '2026-03-17',
    endDate: '2026-03-18',
    tag: 'FOMC',
    importance: 3,
  },
  {
    id: 'fomc-result',
    layer: 'stock',
    title: 'FOMC 결과 발표(한국시간 새벽)',
    date: '2026-03-19',
    tag: 'FOMC',
    importance: 3,
  },
  {
    id: 'shareholder-season',
    layer: 'stock',
    title: '주총 시즌: 소집공고/배당·감사보고서 일정 집중',
    date: '2026-03-01',
    endDate: '2026-03-10',
    tag: '주총시즌',
    importance: 2,
  },
]

export const LAYER_LABELS: Record<Layer, string> = {
  expo: 'EXPO',
  hack: 'HACK',
  stock: 'STOCK',
}
