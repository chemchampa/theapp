import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TimelineContainer } from './TimelineViewStyles';

const Timeline = ({ tasks }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (tasks.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = tasks.length * 40;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");

    const minDate = d3.min(tasks, d => parseDate(d.startDate));
    const maxDate = d3.max(tasks, d => parseDate(d.endDate));

    const x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(tasks.map(d => d.taskName))
      .range([0, height])
      .padding(0.1);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(tasks)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.taskName))
      .attr('height', y.bandwidth())
      .attr('x', d => x(parseDate(d.startDate)))
      .attr('width', d => x(parseDate(d.endDate)) - x(parseDate(d.startDate)))
      .attr('fill', 'steelblue');

  }, [tasks]);

  return (
    <TimelineContainer>
      <svg ref={svgRef}></svg>
    </TimelineContainer>
  );
};

export default Timeline;