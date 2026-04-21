interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Health Check' },
    { number: 3, label: 'Results' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  step.number < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {step.number < currentStep ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <span className="text-sm">{step.number}</span>
                )}
              </div>
              <span className={`mt-2 text-xs hidden sm:block ${
                step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 -mt-5">
                <div
                  className={`h-full transition-all duration-300 ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}