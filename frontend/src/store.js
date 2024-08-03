/*
    This file configures the Redux store, combining reducers from different slices (in this case, just the task slice).
*/

import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './features/TimelineView/taskSlice';

const store = configureStore({
  reducer: {
    tasks: taskReducer,
    // Add other reducers here as needed
  }
});

export default store;