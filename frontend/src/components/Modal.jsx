/**
 * Reusable Modal component with compound components
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

function Modal({ isOpen, onClose, size = 'md', children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

Modal.Header = function ModalHeader({ children, onClose }) {
  return (
    <div className="modal-header">
      <h2>{children}</h2>
      {onClose && (
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

Modal.Body = function ModalBody({ children, className = '' }) {
  return <div className={`modal-body ${className}`}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
};

export default Modal;
