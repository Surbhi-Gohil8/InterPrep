import React from "react";
import { LuTrash } from "react-icons/lu";
import { getInitials } from "../../utils/helper";
const SummaryCard = ({
  colors,
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-2 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      aria-label={`Open session card for ${role}`}
    >
      <div
        className="rounded-lg p-4 cursor-pointer relative group"
        style={{ background: colors.bgcolor }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4">
            <span className="text-lg font-semibold text-black">{getInitials(role)}</span>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[17px] font-medium">{role}</h2>
                <p className="text-xs text-medium text-gray-900">
                  {topicsToFocus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete button (appears on hover) */}
        <button
        
          className="hidden group-hover:flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 px-3 py-1 rounded text-nowrap border border-rose-200 hover:border-rose-300 cursor-pointer absolute top-2 right-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete session for ${role}`}
        >
          <LuTrash />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-3 mt-4">
          <div className="text-[10px] font-medium text-gray-900 px-3 py-1 border border-gray-200 rounded-full">
            Experience: {experience} {experience == 1 ? "Year" : "Years"}
          </div>
          <div className="text-[10px] font-medium text-gray-900 px-3 py-1 border border-gray-200 rounded-full">
            {questions} Q&A
          </div>
          <div className="text-[10px] font-medium text-gray-900 px-3 py-1 border border-gray-200 rounded-full">
            Last Updated: {lastUpdated}
          </div>
        </div>
        <p className="text-[12px] text-gray-500 font-medium line-clamp-2 mt-3">
          {description}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
