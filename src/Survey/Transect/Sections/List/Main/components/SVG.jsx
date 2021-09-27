import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

class SVG extends Component {
  static propTypes = {
    geom: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    const geoLineString = this.props.geom;

    const size = {
      w: 40,
      h: 40,
    };

    const svg = d3
      .select(this.ref.current)
      .attr('width', size.w)
      .attr('height', size.h);

    const graph = svg.append('g');
    const group = graph.append('g');

    const isGeometryCollection = geoLineString.type === 'GeometryCollection';
    const projection = d3
      .geoNaturalEarth1()
      .fitSize(
        [size.w, size.h],
        isGeometryCollection ? geoLineString : geoLineString[0]
      );
    const path = d3.geoPath(projection);

    const strokeColor = (_, index) => {
      return index % 2
        ? 'var(--ion-color-primary-shade)'
        : 'var(--ion-color-secondary-tint)';
    };
    group
      .selectAll('path')
      .data(isGeometryCollection ? geoLineString.geometries : geoLineString)
      .enter()
      .insert('path')
      .attr('width', size.w)
      .attr('height', size.h)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', path);
  };

  render() {
    return <svg ref={this.ref} />;
  }
}

export default SVG;
