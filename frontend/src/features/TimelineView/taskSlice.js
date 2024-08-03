/*
    This file defines a Redux slice for managing tasks. It includes the initial state and reducers for tasks. Reducers are functions that specify how the state
    should change in response to actions. This slice will handle actions like setting all tasks, adding a new task, updating a task, and deleting a task.
*/

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const updateTaskDates = createAsyncThunk(
  "tasks/updateDates",
  async ({ taskId, startDate, endDate }, { getState, dispatch }) => {
    // Here you would typically make an API call to update the task on your backend
    // For now, we'll just return the updated task
    return { id: taskId, startDate, endDate };
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: [],
  reducers: {
    setTasks: (state, action) => {
      return action.payload;
    },
    addTask: (state, action) => {
      state.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      return state.filter(task => task.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateTaskDates.fulfilled, (state, action) => {
      const index = state.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state[index].startDate = action.payload.startDate;
        state[index].endDate = action.payload.endDate;
      }
    });
  }
});

export const { setTasks, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;