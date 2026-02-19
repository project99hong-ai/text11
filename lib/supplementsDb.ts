export type Timing = 'morning' | 'lunch' | 'dinner'

export type SupplementPreset = {
  key: string
  displayName: string
  icon: string
  timing: Timing[]
  benefits: string
  defaultDosagePerDay: number
}

export const SUPPLEMENT_PRESETS: SupplementPreset[] = [
  {
    key: 'milk-thistle',
    displayName: '밀크씨슬',
    icon: 'milk-thistle',
    timing: ['dinner'],
    benefits: '간 건강과 피로 회복을 위한 기본 보조 라인입니다.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'omega3',
    displayName: '오메가3',
    icon: 'omega3',
    timing: ['morning'],
    benefits: '혈행과 컨디션 균형을 위한 필수 지방산 보충.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'vitamin-c',
    displayName: '비타민C',
    icon: 'vitamin-c',
    timing: ['morning', 'lunch'],
    benefits: '항산화와 면역 밸런스를 위한 데일리 루틴.',
    defaultDosagePerDay: 2,
  },
  {
    key: 'vitamin-d',
    displayName: '비타민D',
    icon: 'vitamin-d',
    timing: ['morning'],
    benefits: '뼈 건강과 활력 유지에 필요한 기본 영양소.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'magnesium',
    displayName: '마그네슘',
    icon: 'magnesium',
    timing: ['dinner'],
    benefits: '근육 이완과 숙면 리듬에 도움을 주는 미네랄.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'probiotics',
    displayName: '프로바이오틱스',
    icon: 'probiotics',
    timing: ['morning'],
    benefits: '장 건강과 컨디션 회복을 돕는 균형 케어.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'zinc',
    displayName: '아연',
    icon: 'zinc',
    timing: ['lunch'],
    benefits: '면역 관리와 피부 밸런스를 위한 포인트.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'lutein',
    displayName: '루테인',
    icon: 'lutein',
    timing: ['lunch'],
    benefits: '눈 피로 완화와 집중력을 위한 루틴.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'collagen',
    displayName: '콜라겐',
    icon: 'collagen',
    timing: ['dinner'],
    benefits: '탄력과 회복을 위한 뷰티 루틴에 적합.',
    defaultDosagePerDay: 1,
  },
  {
    key: 'multivitamin',
    displayName: '멀티비타민',
    icon: 'multivitamin',
    timing: ['morning'],
    benefits: '하루 균형을 맞추는 기본 종합 영양제.',
    defaultDosagePerDay: 1,
  },
]

const normalize = (value: string) => value.replace(/\s+/g, '').toLowerCase()

export function findPresetByName(name: string): SupplementPreset | null {
  const normalized = normalize(name)
  return (
    SUPPLEMENT_PRESETS.find(
      (preset) =>
        normalize(preset.displayName) === normalized ||
        normalize(preset.key) === normalized,
    ) ?? null
  )
}
