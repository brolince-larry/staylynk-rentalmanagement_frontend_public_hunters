import aiAssistantOrb from '../../assets/ai-assistant-orb.png';

export function AIThinkingOrb({
  size = 'md',
  thinking = false,
  muted = false,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  thinking?: boolean;
  muted?: boolean;
}) {
  const sizeClass = {
    xs: 'h-5 w-5',
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  }[size];

  return (
    <span className={`${sizeClass} relative flex shrink-0 items-center justify-center rounded-full ${thinking ? 'ai-orb-thinking' : ''} ${muted ? 'opacity-45 grayscale' : ''}`}>
      <img
        src={aiAssistantOrb}
        alt=""
        aria-hidden="true"
        className="ai-orb-image h-full w-full rounded-full object-cover drop-shadow-[0_0_22px_rgba(217,70,239,0.55)]"
        draggable={false}
      />
    </span>
  );
}
