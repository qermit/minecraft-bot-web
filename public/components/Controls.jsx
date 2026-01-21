const Controls = ({ targetX, targetY, targetZ, onTargetXChange, onTargetYChange, onTargetZChange, onGoTo, onSendCommand }) => {
  const MapPinIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const PickaxeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );

  const BoxIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const CameraIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const PackageIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">🎮 Sterowanie</h2>
      
      <div className="space-y-6">
        {/* Idź do pozycji */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MapPinIcon />
            Idź do pozycji
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <input
              type="number"
              placeholder="X"
              value={targetX}
              onChange={(e) => onTargetXChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Y"
              value={targetY}
              onChange={(e) => onTargetYChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Z"
              value={targetZ}
              onChange={(e) => onTargetZChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={onGoTo}
              className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 text-sm font-medium transition-colors"
            >
              Idź
            </button>
          </div>
        </div>

        {/* Szybkie akcje */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="font-bold mb-3">Szybkie akcje</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSendCommand('dig')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <PickaxeIcon />
              Kopaj w dół
            </button>
            <button
              onClick={() => onSendCommand('collectWood')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <BoxIcon />
              Zbieraj drewno
            </button>
            <button
              onClick={() => onSendCommand('followPlayer')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserIcon />
              Śledź gracza
            </button>
            <button
              onClick={() => onSendCommand('screenshot')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CameraIcon />
              Zrzut ekranu
            </button>
            <button
              onClick={() => onSendCommand('stop')}
              className="bg-red-600 hover:bg-red-700 rounded px-4 py-3 text-sm font-medium transition-colors"
            >
              🛑 STOP
            </button>
          </div>
        </div>

        {/* Crafting */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <PackageIcon />
            Crafting
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onSendCommand('craft', { item: 'sticks' })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
            >
              Patyki
            </button>
            <button
              onClick={() => onSendCommand('craft', { item: 'planks' })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
            >
              Deski
            </button>
            <button
              onClick={() => onSendCommand('craft', { item: 'chest' })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
            >
              Skrzynia
            </button>
            <button
              onClick={() => onSendCommand('craft', { item: 'wooden_pickaxe' })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
            >
              Drewn. kilof
            </button>
            <button
              onClick={() => onSendCommand('craft', { item: 'wooden_axe' })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
            >
              Drewn. siekiera
            </button>
            <button
              onClick={() => onSendCommand('craft', { item: 'torch' })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
            >
              Pochodnia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
