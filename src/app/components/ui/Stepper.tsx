import React from "react";

interface StepperProps {
  step: number; // current step (1-based)
  totalSteps?: number; // default 3
}

export function Stepper({ step, totalSteps = 3 }: StepperProps) {
  return (
    <div className="flex items-center gap-4">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const current = idx + 1 === step;
        return (
          <React.Fragment key={idx}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold
                ${current
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700"
                }`}
            >
              {idx + 1}
            </div>
            {idx < totalSteps - 1 && (
              <div className="w-8 h-0.5 bg-slate-200" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;