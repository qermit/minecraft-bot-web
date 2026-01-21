const WorldPreview = ({ viewerData, onSendCommand, onAddLog }) => {
  const [isLoadingViewer, setIsLoadingViewer] = React.useState(false);

  const handleRefreshViewer = () => {
    setIsLoadingViewer(true);
    onSendCommand('getViewerData');
    onAddLog('🔄 Odświeżanie podglądu...');
  };

  const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  React.useEffect(() => {
    if (viewerData) {
      setIsLoadingViewer(false);
    }
  }, [viewerData]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🗺️ Podgląd świata
        </h2>
        <button
          onClick={handleRefreshViewer}
          disabled={isLoadingViewer}
          className="bg-green-600 hover:bg-green-700 rounded px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshIcon />
          {isLoadingViewer ? 'Ładowanie...' : 'Odśwież'}
        </button>
      </div>
      
      {viewerData && viewerData.image ? (
        <div className="bg-gray-900 rounded-lg p-4">
          <img 
            src={`data:image/png;base64,${viewerData.image}`}
            alt="Podgląd świata"
            className="rounded w-full max-h-96 object-contain"
          />
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <div>📍 Pozycja: X: {viewerData.position?.x.toFixed(1)}, Y: {viewerData.position?.y.toFixed(1)}, Z: {viewerData.position?.z.toFixed(1)}</div>
            <div>⏰ Zaktualizowano: {new Date(viewerData.timestamp).toLocaleTimeString('pl-PL')}</div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">
          {isLoadingViewer ? 'Ładowanie podglądu...' : 'Kliknij "Odśwież", aby załadować podgląd'}
        </div>
      )}
    </div>
  );
};
