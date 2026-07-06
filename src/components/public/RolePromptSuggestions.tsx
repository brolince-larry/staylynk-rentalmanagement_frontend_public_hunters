import { Car, GraduationCap, Home, MapPin, Search, Wifi } from 'lucide-react';

const PUBLIC_HUNTER_PROMPTS = [
  { icon: <Search size={15} />, text: 'Find apartments under 30k' },
  { icon: <Car size={15} />, text: 'Family house with parking' },
  { icon: <Home size={15} />, text: 'Pet friendly apartment' },
  { icon: <MapPin size={15} />, text: 'House near CBD' },
  { icon: <GraduationCap size={15} />, text: 'Cheap bedsitter near university' },
  { icon: <Wifi size={15} />, text: 'Safe apartment with WiFi' },
];

export function RolePromptSuggestions({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {PUBLIC_HUNTER_PROMPTS.map(prompt => (
        <button
          key={prompt.text}
          type="button"
          className="group flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[13px] font-semibold leading-5 text-slate-600 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/[0.07] dark:hover:text-white"
          onClick={() => onSelect(prompt.text)}
        >
          <span className="shrink-0 text-violet-500 transition-colors duration-200 group-hover:text-violet-600 dark:text-violet-400 dark:group-hover:text-violet-300">
            {prompt.icon}
          </span>
          <span className="min-w-0 break-words">{prompt.text}</span>
        </button>
      ))}
    </div>
  );
}
