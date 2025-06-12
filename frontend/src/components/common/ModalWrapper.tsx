import React from 'react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper = ({ isOpen, onClose, children }: ModalWrapperProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-hidden cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper; 