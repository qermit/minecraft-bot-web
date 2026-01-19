// minecraft-bot-server.js
// Instalacja: npm install mineflayer express socket.io pathfinder mineflayer-pathfinder minecraft-data

const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalFollow } = goals;

// Konfiguracja
const CONFIG = {
  // Minecraft
  host: '192.168.1.240',           // Adres serwera Minecraft
  port: 25565,                 // Port serwera
  username: 'Bot',             // Nazwa bota
  version: '1.21.1',           // Wersja Minecraft
  
  // Web server
  webPort: 3000                // Port panelu webowego
};

// Tworzenie bota
const bot = mineflayer.createBot({
  host: CONFIG.host,
  port: CONFIG.port,
  username: CONFIG.username,
  version: CONFIG.version,
  auth: 'offline'              // 'microsoft' dla oficjalnych serwerów
});

// Ładowanie pluginów
bot.loadPlugin(pathfinder);

// Express + Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serwowanie panelu React
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minecraft Bot Panel</title>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
  <script src="/socket.io/socket.io.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    // Ikonki SVG
    const ActivityIcon = () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );

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

    const WifiIcon = () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    );

    const WifiOffIcon = () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
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

    function MinecraftBotPanel() {
      const [socket, setSocket] = useState(null);
      const [connected, setConnected] = useState(false);
      const [botStatus, setBotStatus] = useState({
        position: { x: 0, y: 0, z: 0 },
        health: 20,
        food: 20,
        inventory: [],
        activity: 'Rozłączony'
      });
      const [logs, setLogs] = useState([]);
      const [targetX, setTargetX] = useState('');
      const [targetY, setTargetY] = useState('');
      const [targetZ, setTargetZ] = useState('');

      useEffect(() => {
        const newSocket = io('http://localhost:${CONFIG.webPort}');
        setSocket(newSocket);

        newSocket.on('connect', () => {
          setConnected(true);
          addLog('✅ Połączono z serwerem');
        });

        newSocket.on('disconnect', () => {
          setConnected(false);
          addLog('❌ Rozłączono z serwera');
        });

        newSocket.on('status', (data) => {
          setBotStatus(data);
        });

        newSocket.on('log', (message) => {
          addLog(message);
        });

        return () => newSocket.close();
      }, []);

      const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-19), \`[\${timestamp}] \${message}\`]);
      };

      const sendCommand = (cmd, params = {}) => {
        if (socket) {
          socket.emit('command', { type: cmd, params });
        }
      };

      const handleGoTo = () => {
        if (targetX && targetY && targetZ) {
          sendCommand('goTo', { 
            x: parseInt(targetX), 
            y: parseInt(targetY), 
            z: parseInt(targetZ) 
          });
        }
      };

      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-green-400 mb-2">🎮 Minecraft Bot Panel</h1>
                  <p className="text-gray-400">Wersja: 1.21.1 (Java Edition)</p>
                </div>
                <div className="flex items-center gap-2">
                  {connected ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <WifiIcon />
                      <span>Połączony</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <WifiOffIcon />
                      <span>Rozłączony</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status bota */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ActivityIcon />
                    Status
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
                              style={{ width: \`\${(botStatus.health / 20) * 100}%\` }}
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
                              style={{ width: \`\${(botStatus.food / 20) * 100}%\` }}
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
                  </div>
                </div>

                {/* Logi */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4">Logi</h2>
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
              </div>

              {/* Panel komend */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4">Sterowanie</h2>
                  
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
                          onChange={(e) => setTargetX(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Y"
                          value={targetY}
                          onChange={(e) => setTargetY(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Z"
                          value={targetZ}
                          onChange={(e) => setTargetZ(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={handleGoTo}
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
                          onClick={() => sendCommand('dig')}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <PickaxeIcon />
                          Kopaj w dół
                        </button>
                        <button
                          onClick={() => sendCommand('collectWood')}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <BoxIcon />
                          Zbieraj drewno
                        </button>
                        <button
                          onClick={() => sendCommand('followPlayer')}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <UserIcon />
                          Śledź gracza
                        </button>
                        <button
                          onClick={() => sendCommand('stop')}
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
                          onClick={() => sendCommand('craft', { item: 'sticks' })}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
                        >
                          Patyki
                        </button>
                        <button
                          onClick={() => sendCommand('craft', { item: 'planks' })}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
                        >
                          Deski
                        </button>
                        <button
                          onClick={() => sendCommand('craft', { item: 'chest' })}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
                        >
                          Skrzynia
                        </button>
                        <button
                          onClick={() => sendCommand('craft', { item: 'wooden_pickaxe' })}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
                        >
                          Drewn. kilof
                        </button>
                        <button
                          onClick={() => sendCommand('craft', { item: 'wooden_axe' })}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
                        >
                          Drewn. siekiera
                        </button>
                        <button
                          onClick={() => sendCommand('craft', { item: 'torch' })}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-2 text-sm transition-colors"
                        >
                          Pochodnia
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    ReactDOM.render(<MinecraftBotPanel />, document.getElementById('root'));
  </script>
</body>
</html>
  `);
});

// Stan bota
let currentActivity = 'Bezczynny';
let currentTask = null;

// Funkcje pomocnicze
function sendStatus() {
  if (!bot.entity) return;
  
  io.emit('status', {
    position: bot.entity.position,
    health: bot.health,
    food: bot.food,
    activity: currentActivity
  });
}

function log(message) {
  console.log(message);
  io.emit('log', message);
}

// Events bota
bot.on('spawn', () => {
  log('✅ Bot dołączył do gry!');
  currentActivity = 'Bezczynny';
  
  // Wysyłaj status co sekundę
  setInterval(sendStatus, 1000);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  log(`💬 ${username}: ${message}`);
});

bot.on('error', (err) => {
  log(`❌ Błąd: ${err.message}`);
});

bot.on('kicked', (reason) => {
  log(`⚠️ Wyrzucono z serwera: ${reason}`);
});

bot.on('death', () => {
  log('💀 Bot umarł!');
  currentActivity = 'Martwy';
  bot.chat('Respawn za 5 sekund...');
  setTimeout(() => {
    bot.respawn();
  }, 5000);
});

// Obsługa komend z panelu
io.on('connection', (socket) => {
  log('🌐 Panel webowy połączony');
  
  socket.on('command', async (cmd) => {
    try {
      log(`📨 Odebrano komendę: ${cmd.type}`);
      
      switch(cmd.type) {
        case 'goTo':
          await goToPosition(cmd.params.x, cmd.params.y, cmd.params.z);
          break;
          
        case 'dig':
          await digDown();
          break;
          
        case 'collectWood':
          await collectWood();
          break;
          
        case 'followPlayer':
          await followPlayer();
          break;
          
        case 'craft':
          await craftItem(cmd.params.item);
          break;
          
        case 'stop':
          stopCurrentTask();
          break;
          
        default:
          log(`⚠️ Nieznana komenda: ${cmd.type}`);
      }
    } catch (error) {
      log(`❌ Błąd wykonania komendy: ${error.message}`);
    }
  });
});

// Implementacja komend
async function goToPosition(x, y, z) {
  currentActivity = `Idę do [${x}, ${y}, ${z}]`;
  log(`🚶 Idę do pozycji: ${x}, ${y}, ${z}`);
  
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);
  
  const goal = new GoalNear(x, y, z, 1);
  await bot.pathfinder.goto(goal);
  
  currentActivity = 'Bezczynny';
  log('✅ Dotarłem do celu!');
}

async function digDown() {
  currentActivity = 'Kopię w dół';
  log('⛏️ Zaczynam kopać w dół...');
  
  for (let i = 0; i < 5; i++) {
    const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (blockBelow && bot.canDigBlock(blockBelow)) {
      await bot.dig(blockBelow);
      log(`Wykopano: ${blockBelow.name}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  currentActivity = 'Bezczynny';
  log('✅ Zakończono kopanie');
}

async function collectWood() {
  currentActivity = 'Zbieram drewno';
  log('🪵 Szukam drzew...');
  
  const logBlock = bot.findBlock({
    matching: (block) => block.name.includes('log'),
    maxDistance: 32
  });
  
  if (!logBlock) {
    log('❌ Nie znaleziono drzew w pobliżu');
    currentActivity = 'Bezczynny';
    return;
  }
  
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);
  
  await bot.pathfinder.goto(new GoalBlock(logBlock.position.x, logBlock.position.y, logBlock.position.z));
  await bot.dig(logBlock);
  
  log('✅ Zebrano drewno!');
  currentActivity = 'Bezczynny';
}

async function followPlayer() {
  const playerName = Object.keys(bot.players).find(name => name !== bot.username);
  
  if (!playerName) {
    log('❌ Nie znaleziono gracza do śledzenia');
    return;
  }
  
  currentActivity = `Śledzę gracza: ${playerName}`;
  log(`👤 Śledzę gracza: ${playerName}`);
  
  const player = bot.players[playerName];
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);
  
  const goal = new GoalFollow(player.entity, 2);
  bot.pathfinder.setGoal(goal, true);
}

async function craftItem(itemName) {
  currentActivity = `Craftuję: ${itemName}`;
  log(`🔨 Próbuję stworzyć: ${itemName}`);
  
  const mcData = require('minecraft-data')(bot.version);
  const item = mcData.itemsByName[itemName];
  
  if (!item) {
    log(`❌ Nie znaleziono przedmiotu: ${itemName}`);
    currentActivity = 'Bezczynny';
    return;
  }
  
  const recipe = bot.recipesFor(item.id)[0];
  
  if (!recipe) {
    log(`❌ Nie znaleziono receptury dla: ${itemName}`);
    currentActivity = 'Bezczynny';
    return;
  }
  
  try {
    await bot.craft(recipe, 1);
    log(`✅ Stworzono: ${itemName}`);
  } catch (error) {
    log(`❌ Nie udało się stworzyć (brak materiałów?): ${itemName}`);
  }
  
  currentActivity = 'Bezczynny';
}

function stopCurrentTask() {
  bot.pathfinder.setGoal(null);
  currentActivity = 'Zatrzymany';
  log('🛑 Zatrzymano bota');
}

// Start serwera web
server.listen(CONFIG.webPort, () => {
  console.log(`🌐 Panel webowy dostępny na: http://localhost:${CONFIG.webPort}`);
  console.log(`🎮 Łączę się z serwerem Minecraft: ${CONFIG.host}:${CONFIG.port}`);
});