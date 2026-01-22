// minecraft-bot-server.js
// Instalacja: npm install mineflayer express socket.io pathfinder mineflayer-pathfinder minecraft-data

const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
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

// Serwowanie plików statycznych z folderu 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Stan bota
let currentActivity = 'Bezczynny';
let currentTask = null;

// Funkcje pomocnicze
function sendStatus() {
  if (!bot.entity) return;
  
  // Pobierz ekwipunek
  const inventory = bot.inventory.items().map(item => ({
    name: item.name,
    displayName: item.displayName,
    count: item.count,
    slot: item.slot
  }));
  
  io.emit('status', {
    position: bot.entity.position,
    health: bot.health,
    food: bot.food,
    activity: currentActivity,
    inventory: inventory
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