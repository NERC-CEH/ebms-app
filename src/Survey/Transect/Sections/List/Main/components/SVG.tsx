import { useRef, useEffect } from 'react';
import { select, geoNaturalEarth1, geoPath } from 'd3';

type Geometry = {
  type: string;
  geometries?: any[];
  [key: string]: any;
};

type Props = {
  geom: Geometry | Geometry[];
};

const SVG = ({ geom }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const geoLineString = geom;

    const size = {
      w: 40,
      h: 40,
    };

    const svg = select(ref.current)
      .attr('width', size.w)
      .attr('height', size.h);

    const graph = svg.append('g');
    const group = graph.append('g');

    const isGeometryCollection =
      (geoLineString as Geometry).type === 'GeometryCollection';

    const projection = geoNaturalEarth1().fitSize(
      [size.w, size.h],
      isGeometryCollection
        ? (geoLineString as any)
        : (geoLineString as Geometry[])[0]
    );

    const path = geoPath(projection);

    const strokeColor = (_: any, index: number) =>
      index % 2
        ? 'var(--ion-color-primary-shade)'
        : 'var(--ion-color-tertiary-tint)';

    const data = isGeometryCollection
      ? (geoLineString as Geometry).geometries!
      : (geoLineString as any[]);

    group
      .selectAll('path')
      .data(data)
      .enter()
      .insert('path')
      .attr('width', size.w)
      .attr('height', size.h)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', path);
  }, [geom]);

  return <svg ref={ref} />;
};

export default SVG;
