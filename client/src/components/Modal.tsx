import { X } from 'lucide-react';
import { useEffect } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  darkMode?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showFooter = false,
  footerContent,
  darkMode = false
}: ModalProps) => {
  // Bloquer le défilement et gérer la fermeture avec ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getModalWidth = (): string => {
    const sizes: Record<ModalSize, string> = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };
    return sizes[size];
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`${getModalWidth()} w-full rounded-lg shadow-lg transition-all ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        {/* En-tête de la modale */}
        <div className={`flex items-center justify-between p-4 ${
          darkMode ? 'border-b border-gray-700' : 'border-b'
        }`}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className={`rounded-full p-1 hover:bg-opacity-10 ${
              darkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-700'
            }`}
            onClick={onClose}
          >
            <X className={`h-5 w-5 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
          {children}
        </div>

        {/* Pied de la modale (optionnel) */}
        {showFooter && (
          <div className={`flex items-center justify-end p-4 ${
            darkMode ? 'border-t border-gray-700' : 'border-t'
          }`}>
            {footerContent || (
              <button
                className={`rounded-md px-4 py-2 ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={onClose}
              >
                Fermer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
