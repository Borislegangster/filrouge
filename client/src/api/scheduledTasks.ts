import axios from './api';

// This function should be called at regular intervals (e.g., every hour)
// to check for overdue checkouts and update their status
export const updateOverdueCheckouts = async (): Promise<void> => {
  try {
    // Call the backend endpoint to update overdue checkouts
    await axios.post('/api/v1/checkouts/update-overdue');
  } catch (error) {
    console.error('Error updating overdue checkouts:', error);
  }
};

// Optional: function to setup a timer that calls updateOverdueCheckouts periodically
export const setupCheckoutStatusUpdater = (intervalMinutes = 60): () => void => {
  // Convert minutes to milliseconds
  const interval = intervalMinutes * 60 * 1000;
  
  // Initial update
  updateOverdueCheckouts();
  
  // Setup interval
  const timerId = setInterval(updateOverdueCheckouts, interval);
  
  // Return a cleanup function
  return () => clearInterval(timerId);
};