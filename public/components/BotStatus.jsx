const BotStatus = ({ socket }) => {
  const [botStatus, setBotStatus] = React.useState({
    position: { x: 0, y: 0, z: 0 },
    health: 20,
    food: 20,
    inventory: [],
    hotbar: Array(9).fill(null),
    armor: {
      head: null,
      chest: null,
      legs: null,
      feet: null
    },
    activity: 'Rozłączony'
  });

  React.useEffect(() => {
    if (!socket) return;

    socket.on('status', (data) => {
      setBotStatus(data);
    });

    return () => {
      socket.off('status');
    };
  }, [socket]);
  const MapPinIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const HeartIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  const PackageIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v-0.5M12 8a4 4 0 00-4 4v4a2 2 0 002 2h8a2 2 0 002-2v-4a4 4 0 00-4-4m0 0V5a2 2 0 10-4 0v3m4 0h-4" />
    </svg>
  );

  const ToolIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const BoxIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        📊 Status
      </h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <MapPinIcon />
            <span className="text-sm">Pozycja</span>
          </div>
          <div className="bg-gray-900 rounded p-2 font-mono text-sm">
            X: {botStatus.position.x.toFixed(1)}<br/>
            Y: {botStatus.position.y.toFixed(1)}<br/>
            Z: {botStatus.position.z.toFixed(1)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <HeartIcon />
            <span className="text-sm">Zdrowie</span>
          </div>
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-red-500 h-4 rounded-full transition-all"
                  style={{ width: `${(botStatus.health / 20) * 100}%` }}
                />
              </div>
              <span className="text-sm">{botStatus.health}/20</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <PackageIcon />
            <span className="text-sm">Głód</span>
          </div>
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-orange-500 h-4 rounded-full transition-all"
                  style={{ width: `${(botStatus.food / 20) * 100}%` }}
                />
              </div>
              <span className="text-sm">{botStatus.food}/20</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-gray-400 mb-1 text-sm">Aktywność</div>
          <div className="bg-gray-900 rounded p-2 text-green-400 font-mono text-sm">
            {botStatus.activity}
          </div>
        </div>

        {/* Zbroja */}
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ShieldIcon />
            <span className="text-sm">Zbroja</span>
          </div>
          <div className="bg-gray-900 rounded p-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Głowa:</span>
              <span className="text-green-400 font-mono">{botStatus.armor?.head || 'Brak'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Tors:</span>
              <span className="text-green-400 font-mono">{botStatus.armor?.chest || 'Brak'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Nogi:</span>
              <span className="text-green-400 font-mono">{botStatus.armor?.legs || 'Brak'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Stopy:</span>
              <span className="text-green-400 font-mono">{botStatus.armor?.feet || 'Brak'}</span>
            </div>
          </div>
        </div>

        {/* Hot Inventory */}
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ToolIcon />
            <span className="text-sm">Hot Inventory</span>
          </div>
          <div className="grid grid-cols-9 gap-1">
            {botStatus.hotbar && botStatus.hotbar.map((item, index) => (
              <div 
                key={index}
                className="bg-gray-900 border border-gray-700 rounded aspect-square flex items-center justify-center text-xs text-center p-1 hover:border-gray-600 transition-colors relative"
                title={item ? item.name : 'Puste'}
              >
                {item ? (
                  <div className="text-green-400 font-mono text-xs flex flex-col items-center">
                    <div>{item.displayName ? item.displayName.substring(0, 2).toUpperCase() : item.name ? item.name.substring(0, 2).toUpperCase() : '?'}</div>
                    {item.count && item.count > 1 && (
                      <div className="text-yellow-400 text-xs font-bold absolute bottom-0 right-0 bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center">{item.count}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600">-</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Full Inventory */}
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <BoxIcon />
            <span className="text-sm">Pełny Inventarz</span>
          </div>
          <div className="bg-gray-900 rounded p-3 max-h-64 overflow-y-auto">
            {botStatus.inventory && botStatus.inventory.length > 0 ? (
              <div className="space-y-1 text-xs">
                {botStatus.inventory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded hover:bg-gray-700 transition-colors">
                    <span className="text-green-400 font-mono truncate">{item.displayName || item.name || 'Nieznany'}</span>
                    <span className="text-yellow-400 font-bold ml-2">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-xs">Inventarz pusty</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
