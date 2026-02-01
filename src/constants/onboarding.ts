export const ONBOARDING_STEPS = [
  { id: 'basic', title: 'Basic info', order: 1 },
  { id: 'voice', title: 'Brand voice', order: 2 },
  { id: 'visual', title: 'Visual identity', order: 3 },
  { id: 'notifications', title: 'Notifications', order: 4 },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = ['basic', 'voice', 'visual', 'notifications'];

export function getStepIndex(stepId: OnboardingStepId): number {
  const i = ONBOARDING_STEP_ORDER.indexOf(stepId);
  return i >= 0 ? i : 0;
}

export function getStepId(index: number): OnboardingStepId {
  return ONBOARDING_STEP_ORDER[Math.max(0, Math.min(index, ONBOARDING_STEP_ORDER.length - 1))];
}
