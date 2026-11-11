import { useContext } from 'react';
import { FeedbackContext } from '../context/feedbackContext';

export default function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback phải được dùng bên trong FeedbackProvider');
  }
  return ctx;
}
