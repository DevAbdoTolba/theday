import React, { useSyncExternalStore } from 'react';
import { selectionStore } from '../../utils/selectionStore';

interface Props {
  isSelectable: boolean;
  fileId: string;
}

export default function SelectionOverlay({ isSelectable, fileId }: Props) {
  const isSelected = useSyncExternalStore(
    selectionStore.subscribe,
    () => selectionStore.isSelected(fileId),
    () => false,
  );

  if (!isSelectable) return null;

  return (
    <div
      aria-hidden="true"
      className="study-selection"
      data-selected={isSelected}
    >
      <div className="study-selection__badge">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {isSelected ? (
            <path d="m6.8 12.4 3.15 3.15 7.25-7.25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </div>
    </div>
  );
}
