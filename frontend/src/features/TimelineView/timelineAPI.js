/*
    The purpose of these API calls is to interact with the backend, specifically for CRUD operations on timeline data (tasks).
    They will be used in the React components to fetch, create, update, and delete tasks.
*/

import axios from 'axios';

export const fetchTimelineData = async () => {
  try {
    const response = await axios.get('/api/timeline/timeline-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
  }
};

export const createTimelineItem = async (newItem) => {
  try {
    const response = await axios.post('/api/timeline/timeline-data', newItem);
    return response.data;
  } catch (error) {
    console.error('Error creating timeline item:', error);
    throw error;
  }
};

export const updateTimelineItem = async (id, updatedItem) => {
  try {
    const response = await axios.put(`/api/timeline/timeline-data/${id}`, updatedItem);
    return response.data;
  } catch (error) {
    console.error('Error updating timeline item:', error);
    throw error;
  }
};

export const deleteTimelineItem = async (id) => {
  try {
    await axios.delete(`/api/timeline/timeline-data/${id}`);
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    throw error;
  }
};