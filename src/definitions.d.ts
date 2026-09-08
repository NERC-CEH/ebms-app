declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import { FC, SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.po' {
  const content: Record<string, string[]>;
  export default content;
}

declare module '*.pot' {
  const content: Record<string, string[]>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '@mapbox/geojson-area' {
  export function geometry(geojson: GeoJSON.Geometry): number;
}
