import { memo } from 'react';
import clsx from 'clsx';

interface BlurPlaceholderProps {
  placeholder?: string | null;
  dominantColor?: string | null;
  className?: string;
}

export const BlurPlaceholder = memo(function BlurPlaceholder({
  placeholder,
  dominantColor,
  className,
}: BlurPlaceholderProps) {
  const isDataImage = placeholder?.startsWith('data:image/');

  return (
    <div
      className={clsx('absolute inset-0', className)}
      style={{ backgroundColor: dominantColor ?? '#e2e8f0' }}
      aria-hidden="true"
    >
      {isDataImage && placeholder && (
        <img
          src={placeholder}
          alt=""
          loading="lazy"
          className="h-full w-full scale-105 object-cover blur-xl"
          decoding="async"
          draggable={false}
        />
      )}
    </div>
  );
});
