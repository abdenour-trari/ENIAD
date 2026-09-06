import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './Button';

export const FullscreenToggle: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Erreur lors de la bascule en plein écran :", err);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleFullscreen}
      leftIcon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
    >
      {isFullscreen ? "Quitter plein écran" : "Plein écran"}
    </Button>
  );
};
