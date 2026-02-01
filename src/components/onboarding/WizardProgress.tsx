'use client';

import { ONBOARDING_STEPS } from '@/constants/onboarding';

type WizardProgressProps = {
  currentStepIndex: number;
};

export function WizardProgress({ currentStepIndex }: WizardProgressProps) {
  return (
    <div className="wizard-progress" style={{ flexWrap: 'wrap', gap: 8 }}>
      {ONBOARDING_STEPS.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isDone = index < currentStepIndex;
        return (
          <div key={step.id} className="wizard-step" style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`wizard-step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isDone ? '✓' : index + 1}
            </div>
            <span className={`wizard-step-label ${isActive ? 'active' : ''}`}>{step.title}</span>
            {index < ONBOARDING_STEPS.length - 1 && (
              <div className={`wizard-connector ${isDone ? 'done' : ''}`} style={{ marginLeft: 8 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
