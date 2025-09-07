import React from 'react';
import { getKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp: React.FC = () => {
  const shortcuts = getKeyboardShortcuts();

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600">{shortcut.description}</span>
            <div className="flex items-center space-x-1">
              {shortcut.keys.map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center">
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="mx-1 text-gray-400">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> These shortcuts work when the grid has focus. 
          Click anywhere in the grid area to enable keyboard navigation.
        </p>
      </div>
    </div>
  );
};
