import React from 'react';
import { ControlsContainer, ZoomButton } from './TimelineViewStyles';

const TimelineControls = () => {
  return (
    <ControlsContainer>
      <ZoomButton onClick={() => console.log('Zoom in')}>Zoom In</ZoomButton>
      <ZoomButton onClick={() => console.log('Zoom out')}>Zoom Out</ZoomButton>
    </ControlsContainer>
  );
};

export default TimelineControls;