'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();

  React.useEffect(() => {
    if (ref.current) {
      ref.current.src = props.url;
    }

    const iframe: HTMLIFrameElement | null = ref.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [props.url]);

  const ref = React.useRef<HTMLIFrameElement>(null);

  const handleIframeLoaded = () => {
    if (!ref.current) {
      return;
    }
    const iframe: HTMLIFrameElement = ref.current;
    if (iframe) iframe.style.opacity = '1';
  };

  const handleGoBack = React.useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/home');
  }, [router]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
      }}>
      <div className="absolute left-4 top-4 z-20">
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={handleGoBack}>
          <Icons.chevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>
      <iframe
        ref={ref}
        width="100%"
        height="100%"
        title="Watch player"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default EmbedPlayer;
