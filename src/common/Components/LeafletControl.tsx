import React from 'react';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

// Classes used by Leaflet to position controls.
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
} as const;

const MapCustomControl = (props: MapCustomControlProps): JSX.Element | null => {
  const { position, className, containerProps, children, isDisabled } = props;

  if (isDisabled) return null;

  return (
    <div className={`${POSITION_CLASSES[position]} ${className}`}>
      <div className="leaflet-control leaflet-bar" {...containerProps}>
        {children}
      </div>
    </div>
  );
};

export type MapCustomControlProps = {
  position: keyof typeof POSITION_CLASSES;
  className?: string;
  containerProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  children: ReactNode;
  isDisabled?: boolean;
};

MapCustomControl.defaultProps = {
  position: 'topleft' as MapCustomControlProps['position'],
  containerProps: {},
  children: null,
};

export default MapCustomControl;
