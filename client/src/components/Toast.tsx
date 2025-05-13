import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastProps {
  darkMode: boolean;
}

export default function Toast({ darkMode }: ToastProps) {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={darkMode ? 'dark' : 'light'}
    />
  );
}