declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.svg?react' {
  import { FC, SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.po' {
  const content: any;
  export default content;
}

declare module '*.pot' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '@mapbox/geojson-area' {
  export function geometry(geojson: { type: string; coordinates: any }): number;
}
