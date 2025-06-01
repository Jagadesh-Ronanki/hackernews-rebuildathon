import React, { useRef, useEffect, useCallback } from 'react';

interface IntersectionObserverProps {
  onIntersect: () => void;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function LoadMoreTrigger({
  onIntersect,
  rootMargin = '100px',
  threshold = 0.1,
  enabled = true,
  children,
  className = ''
}: IntersectionObserverProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && enabled) {
      onIntersect();
    }
  }, [onIntersect, enabled]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleIntersect, rootMargin, threshold]);

  return (
    <div 
      ref={targetRef} 
      className={`transition-opacity duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
