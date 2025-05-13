import { toast } from 'react-toastify';
import { ApiError } from '../types/api';

export function handleApiError(error: unknown) {
  if (typeof error === 'string') {
    toast.error(error);
    return;
  }

  const apiError = error as ApiError;
  
  if (apiError.message) {
    toast.error(apiError.message);
    return;
  }

  if (apiError.errors) {
    Object.values(apiError.errors).forEach(errorMessages => {
      errorMessages.forEach(message => toast.error(message));
    });
    return;
  }

  toast.error('Une erreur inattendue est survenue');
}