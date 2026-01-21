const Logs = ({ logs }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">📋 Logi</h2>
      <div className="bg-gray-900 rounded p-3 h-64 overflow-y-auto font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500">Brak logów...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="text-gray-300">{log}</div>
          ))
        )}
      </div>
    </div>
  );
};
