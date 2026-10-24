import { useState } from 'react';

const STEPS = [
  {
    title: '1. Wi-Fi travels through a room',
    detail: 'A compatible router sends ordinary radio packets. Walls, furniture, and people affect the paths those signals take.'
  },
  {
    title: '2. A receiver measures CSI',
    detail: 'Channel State Information describes how each Wi-Fi subcarrier arrives, including its signal strength and phase.'
  },
  {
    title: '3. Software looks for changes',
    detail: 'Movement can change the measurements. A trained system may estimate broad activity patterns, but it needs calibration and careful testing.'
  }
];

const WORKFLOW_STAGES = [
  'Capture a mock signal sample',
  'Compare illustrative channel changes',
  'Classify the selected activity pattern',
  'Share the mock result with Guardian'
];

export default function WifiCsiExplanation({ csiState, onRun, canControl = false }) {
  const [scenario, setScenario] = useState('movement');
  const isScanning = csiState.status === 'scanning';
  const isComplete = csiState.status === 'complete';
  const isPossibleFall = isComplete && csiState.scenario === 'possible_fall';

  return (
    <section className="space-y-4 rounded-lg border border-tealbrand-200 bg-tealbrand-50 p-3 sm:p-4" aria-labelledby="wifi-csi-explainer-title">
      <div>
        <h4 id="wifi-csi-explainer-title" className="text-xs font-bold text-tealbrand-950">Wi-Fi CSI mock workflow</h4>
        <p className="mt-1 text-xs leading-relaxed text-tealbrand-900">
          CSI is information about a Wi-Fi signal’s path between a transmitter and receiver. Changes in those paths may reveal movement; CSI is not a camera and does not directly identify a person or diagnose a health condition.
        </p>
      </div>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {STEPS.map(({ title, detail }) => (
          <li key={title} className="rounded border border-tealbrand-100 bg-white p-3">
            <strong className="block text-xs text-stone-800">{title}</strong>
            <span className="mt-1 block text-xs leading-relaxed text-stone-600">{detail}</span>
          </li>
        ))}
      </ol>
      <div className="rounded border border-tealbrand-100 bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h5 className="text-xs font-bold text-stone-800">Try the end-to-end sample</h5>
            <p className="mt-1 text-xs text-stone-600">
              {canControl
                ? 'Choose a mock activity and run the steps. The result is shared with Guardian.'
                : 'This view receives the latest mock scan started from the Member screen.'}
            </p>
          </div>
          {canControl && (
            <div className="flex flex-col gap-2 sm:min-w-64 sm:flex-row">
              <label className="sr-only" htmlFor="csi-mock-scenario">Mock activity to classify</label>
              <select
                id="csi-mock-scenario"
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
                disabled={isScanning}
                className="min-w-0 flex-1 rounded border border-stone-300 bg-white px-2.5 py-2 text-xs text-stone-800"
              >
                <option value="movement">Normal movement</option>
                <option value="possible_fall">Possible fall-like pattern</option>
              </select>
              <button
                type="button"
                onClick={() => onRun(scenario)}
                disabled={isScanning}
                className="rounded bg-tealbrand-700 px-3 py-2 text-xs font-bold text-white hover:bg-tealbrand-800 disabled:cursor-wait disabled:bg-stone-400"
              >
                {isScanning ? 'Scanning…' : 'Run mock scan'}
              </button>
            </div>
          )}
        </div>

        <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {WORKFLOW_STAGES.map((label, index) => {
            const isDone = isComplete || (isScanning && index < csiState.stage);
            const isCurrent = isScanning && csiState.stage === index;
            return (
              <li
                key={label}
                className={`rounded border p-2.5 text-xs ${
                  isCurrent
                    ? 'border-tealbrand-600 bg-tealbrand-50 text-tealbrand-950'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-stone-200 bg-stone-50 text-stone-500'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="mr-1 font-bold">{isDone ? 'Done:' : isCurrent ? 'Now:' : 'Next:'}</span>
                {label}
              </li>
            );
          })}
        </ol>

        {isComplete && (
          <div
            role="status"
            className={`mt-3 rounded border p-3 text-xs ${
              isPossibleFall
                ? 'border-amber-300 bg-amber-50 text-amber-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
            }`}
          >
            <strong className="block">{isPossibleFall ? 'Mock alert shared with Guardian' : 'Mock activity shared with Guardian'}</strong>
            <span className="mt-1 block">
              {csiState.activity}. This is a selected sample outcome, not a measured detection. It does not start the ResQ fall-alert or responder-dispatch flow.
            </span>
          </div>
        )}
        {csiState.status === 'idle' && (
          <p className="mt-3 rounded border border-dashed border-stone-300 p-3 text-xs text-stone-600">
            No mock scan has been run. Choose a pattern and run the scan to see the workflow.
          </p>
        )}
      </div>
      <p className="text-xs leading-relaxed text-stone-600">
        Real use would need compatible Wi-Fi hardware, a tested model, setup for the specific home, consent, and checks for missed events and false alarms. ResQ currently collects no Wi-Fi CSI: this workflow uses only a selected mock outcome, and the waves and room display are animated illustrations.
      </p>
    </section>
  );
}
