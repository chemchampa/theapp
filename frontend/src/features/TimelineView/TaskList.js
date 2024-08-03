import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTask } from './taskSlice';
import { createTimelineItem } from './timelineAPI';
import { TaskListContainer, TaskItem, TaskForm } from './TimelineViewStyles';

const TaskList = () => {
  const tasks = useSelector(state => state.tasks);
  const dispatch = useDispatch();
  const [newTask, setNewTask] = useState({ taskName: '', startDate: '', endDate: '', assignee: '', progress: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdTask = await createTimelineItem(newTask);
      dispatch(addTask(createdTask));
      setNewTask({ taskName: '', startDate: '', endDate: '', assignee: '', progress: 0 });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <TaskListContainer>
      <h2>Tasks</h2>
      {tasks.map(task => (
        <TaskItem key={task.id}>
          <h3>{task.taskName}</h3>
          <p>Start: {task.startDate}</p>
          <p>End: {task.endDate}</p>
          <p>Assignee: {task.assignee}</p>
          <p>Progress: {task.progress}%</p>
        </TaskItem>
      ))}
      <TaskForm onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task name"
          value={newTask.taskName}
          onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
        />
        <input
          type="date"
          value={newTask.startDate}
          onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
        />
        <input
          type="date"
          value={newTask.endDate}
          onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="Assignee"
          value={newTask.assignee}
          onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
        />
        <input
          type="number"
          placeholder="Progress"
          value={newTask.progress}
          onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) })}
        />
        <button type="submit">Add Task</button>
      </TaskForm>
    </TaskListContainer>
  );
};

export default TaskList;