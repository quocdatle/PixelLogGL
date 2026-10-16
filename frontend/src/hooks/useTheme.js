import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Dùng trong bất kỳ component nào cần biết theme hiện tại hoặc đổi theme.
// Bắt buộc component phải nằm trong <ThemeProvider> (đã bọc ở main.jsx).
export default function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() phải được gọi bên trong <ThemeProvider>');
  }
  return ctx;
}
