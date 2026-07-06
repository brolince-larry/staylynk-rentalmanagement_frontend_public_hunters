import { useNavigate } from 'react-router-dom';
import { AIThinkingOrb } from './AIThinkingOrb';

export function AIAssistantLauncher() {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-50">
      <div className="relative">
        <span
          className="absolute inset-0 rounded-full bg-fuchsia-500/40 ai-launcher-ping"
          aria-hidden="true"
        />
        <button
          type="button"
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1a1028] to-slate-950 shadow-2xl shadow-fuchsia-700/40 ring-2 ring-fuchsia-500/55 transition-all duration-300 hover:-translate-y-1 hover:shadow-fuchsia-400/55 hover:ring-fuchsia-400/75 focus:outline-none focus:ring-4 focus:ring-fuchsia-300/35"
          onClick={() => navigate('/ai')}
          aria-label="Open AI Property Search"
        >
          <AIThinkingOrb size="md" />
        </button>
      </div>
    </div>
  );
}
