import { useRef, useEffect } from 'react';
import { select, geoNaturalEarth1, geoPath } from 'd3';
import type { Feature, Geometry, GeometryCollection } from 'geojson';

type Drawable = Geometry | Feature;

type Props = {
  geom: Drawable | Drawable[];
};

const SVG = ({ geom }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let geometries: Drawable[] = Array.isArray(geom) ? geom : [geom];
    if (!Array.isArray(geom) && geom.type === 'GeometryCollection') {
      geometries = geom.geometries;
    }

    const size = { w: 40, h: 40 };
    const collection: GeometryCollection = {
      type: 'GeometryCollection',
      geometries: geometries.map(item =>
        item.type === 'Feature' ? item.geometry : item
      ),
    };
    const projection = geoNaturalEarth1().fitSize([size.w, size.h], collection);
    const path = geoPath(projection);

    select(ref.current)
      .attr('width', size.w)
      .attr('height', size.h)
      .append('g')
      .selectAll('path')
      .data(geometries)
      .enter()
      .insert('path')
      .attr('width', size.w)
      .attr('height', size.h)
      .attr('stroke', (_, index) =>
        index % 2
          ? 'var(--ion-color-primary-shade)'
          : 'var(--ion-color-tertiary-tint)'
      )
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', item => path(item));
  }, [geom]);

  return <svg ref={ref} />;
};

export default SVG;
