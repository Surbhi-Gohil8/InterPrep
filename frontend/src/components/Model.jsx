import React, { useEffect } from "react";

const Model = ({ children, isOpen, onClose, hideHeader }) => {
  // Escape key close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null; // hide modal if not open

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // close when clicking outside
    >
      <div
        className="bg-white rounded-lg p-6 relative w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        {!hideHeader && (
          <div className="mb-4">
            <h3 id="modal-title" className="text-lg font-semibold">
              Modal
            </h3>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l12 12M13 1L1 13"
            />
          </svg>
        </button>

        {/* Modal body */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Model;
