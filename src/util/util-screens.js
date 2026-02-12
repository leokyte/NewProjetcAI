import { Breakpoints } from '../enums/Breakpoints';
import { Viewports } from '@kyteapp/kyte-ui-components';

export const modalScreenOptions = (isMobile) => ({
    cardStyle: { backgroundColor: 'transparent' },
    cardOverlayEnabled: false,
    animationEnabled: isMobile,
  });
export const renderScreenAsModal = (isMobile, screen, screenModal) => isMobile ? screen : screenModal(screen);

export const calculateViewport = (width) => {
  const isMobile = width < Breakpoints[Viewports.Tablet];
  const viewport = isMobile ? Viewports.Mobile : Viewports.Tablet;

  return viewport;
} 