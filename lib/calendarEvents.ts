export type Layer = 'expo' | 'hackathon' | 'stock'

export type CalEvent = {
  id: string
  layer: Layer
  title: string
  date: string
  endDate?: string
  location?: string
  importance?: number
  tag?: string
}

export const CAL_EVENTS: CalEvent[] = [
  {
    id: 'zkd-openai-primer-deadline',
    layer: 'hackathon',
    title: '조코딩 X OpenAI X 프라이머 AI 해커톤 · 과제 제출 마감 23:59',
    date: '2026-02-20',
    importance: 5,
    tag: '마감',
  },
  {
    id: 'zkd-openai-primer-prelim',
    layer: 'hackathon',
    title: '예선 심사',
    date: '2026-02-21',
    endDate: '2026-03-01',
    importance: 3,
  },
  {
    id: 'zkd-openai-primer-announce',
    layer: 'hackathon',
    title: '예선 결과 발표',
    date: '2026-03-02',
    importance: 5,
    tag: '발표',
  },
  {
    id: 'zkd-openai-primer-finals',
    layer: 'hackathon',
    title: '오프라인 본선·시상식',
    date: '2026-03-07',
    importance: 5,
    tag: '본선',
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
    importance: 4,
    tag: '휴장',
  },
  {
    id: 'krx-seollal-2',
    layer: 'stock',
    title: 'KRX 설 연휴 휴장',
    date: '2026-02-17',
    importance: 4,
    tag: '휴장',
  },
  {
    id: 'krx-seollal-3',
    layer: 'stock',
    title: 'KRX 설 연휴 휴장',
    date: '2026-02-18',
    importance: 4,
    tag: '휴장',
  },
  {
    id: 'krx-mar1-holiday',
    layer: 'stock',
    title: '3·1절 대체휴일 휴장',
    date: '2026-03-02',
    importance: 4,
    tag: '휴장',
  },
  {
    id: 'krx-quad-witching',
    layer: 'stock',
    title: '네 마녀의 날(동시만기)',
    date: '2026-03-12',
    importance: 4,
    tag: '동시만기',
  },
]

export const LAYER_LABELS: Record<Layer, string> = {
  expo: 'EXPO',
  hackathon: 'HACK',
  stock: 'STOCK',
}
