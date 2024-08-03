import React from 'react';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { GanttChartContainer } from './TimelineViewStyles';

const GanttChart = ({ tasks }) => {
  const data = {
    datasets: tasks.map(task => ({
      label: task.taskName,
      data: [{
        x: [new Date(task.startDate), new Date(task.endDate)],
        y: task.taskName
      }],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }))
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <GanttChartContainer>
      <Chart type='bar' data={data} options={options} />
    </GanttChartContainer>
  );
};

export default GanttChart;