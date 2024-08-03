// v.4
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTimelineData } from './timelineAPI';
import { setTasks } from './taskSlice';
import { TimelineViewContainer } from './TimelineViewStyles';
import CustomGantt from './CustomGantt';

const TimelineView = () => {
  const tasks = useSelector(state => state.tasks);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const data = await fetchTimelineData();
        dispatch(setTasks(data));
      } catch (err) {
        console.error('Failed to load timeline data:', err);
      }
    };

    loadTimelineData();
  }, [dispatch]);

  return (
    <TimelineViewContainer>
      <h1>Timeline View</h1>
      <CustomGantt tasks={tasks} />
    </TimelineViewContainer>
  );
};

export default TimelineView;


/*
// v.3
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTimelineData } from './timelineAPI';
import { setTasks } from './taskSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TimelineViewContainer } from './TimelineViewStyles';

const TimelineView = () => {
  const tasks = useSelector(state => state.tasks);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const data = await fetchTimelineData();
        dispatch(setTasks(data));
      } catch (err) {
        console.error('Failed to load timeline data:', err);
      }
    };

    loadTimelineData();
  }, [dispatch]);

  const chartData = tasks.map(task => ({
    name: task.taskName,
    start: new Date(task.startDate).getTime(),
    duration: new Date(task.endDate).getTime() - new Date(task.startDate).getTime(),
  }));

  return (
    <TimelineViewContainer>
      <h1>Timeline View</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" dataKey="start" domain={['dataMin', 'dataMax']} tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()} />
          <YAxis type="category" dataKey="name" />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value, name) => [
              `Duration: ${Math.round(value / (1000 * 60 * 60 * 24))} days`,
              name
            ]}
          />
          <Bar dataKey="duration" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </TimelineViewContainer>
  );
};

export default TimelineView;
*/



/*
// v.2
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTimelineData } from './timelineAPI';
import { setTasks } from './taskSlice';
import TaskList from './TaskList';
import Timeline from './Timeline';
import TimelineControls from './TimelineControls';
import { TimelineViewContainer } from './TimelineViewStyles';

const TimelineView = () => {
  const tasks = useSelector(state => state.tasks);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const data = await fetchTimelineData();
        dispatch(setTasks(data));
      } catch (err) {
        console.error('Failed to load timeline data:', err);
      }
    };

    loadTimelineData();
  }, [dispatch]);

  return (
    <TimelineViewContainer>
      <h1>Timeline View</h1>
      <TimelineControls />
      <TaskList />
      <Timeline tasks={tasks} />
    </TimelineViewContainer>
  );
};

export default TimelineView;
*/



/*
import React, { useState, useEffect } from 'react';
import { fetchTimelineData } from '../../utils/api';
import TaskList from './TaskList';
import GanttChart from './GanttChart';
import TimelineControls from './TimelineControls';
import { TimelineViewContainer } from './TimelineViewStyles';

const TimelineView = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const data = await fetchTimelineData();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load timeline data');
        setLoading(false);
      }
    };

    loadTimelineData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <TimelineViewContainer>
      <h1>Timeline View</h1>
      <TimelineControls />
      <TaskList tasks={tasks} />
      <GanttChart tasks={tasks} />
    </TimelineViewContainer>
  );
};

export default TimelineView;
*/