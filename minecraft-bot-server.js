// minecraft-bot-server.js
// Instalacja: npm install mineflayer express socket.io pathfinder mineflayer-pathfinder minecraft-data

const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalFollow } = goals;
const { Viewer } = require('prismarine-viewer');

// Konfiguracja
const CONFIG = {
  // Minecraft
  host: '192.168.1.240',           // Adres serwera Minecraft
  port: 25565,                 // Port serwera
  username: 'Bot',             // Nazwa bota
  version: '1.21.1',           // Wersja Minecraft
  
  // Web server
  webPort: 4040                // Port panelu webowego
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
function getInventoryData() {
  const inventory = [];
  for (let i = 9; i < bot.inventory.slots.length; i++) {
    const item = bot.inventory.slots[i];
    if (item) {
      inventory.push({
        slot: i,
        name: item.name,
        displayName: item.displayName || item.name,
        count: item.count,
        type: item.type
      });
    }
  }
  return inventory;
}

function getHotbarData() {
  const hotbar = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    const item = bot.inventory.slots[i];
    if (item) {
      hotbar[i] = {
        slot: i,
        name: item.name,
        displayName: item.displayName || item.name,
        count: item.count,
        type: item.type
      };
    }
  }
  return hotbar;
}

function sendStatus() {
  if (!bot.entity) return;
  
  io.emit('status', {
    position: bot.entity.position,
    health: bot.health,
    food: bot.food,
    inventory: getInventoryData(),
    hotbar: getHotbarData(),
    armor: {
      head: bot.inventory.slots[5]?.displayName || bot.inventory.slots[5]?.name || null,
      chest: bot.inventory.slots[4]?.displayName || bot.inventory.slots[4]?.name || null,
      legs: bot.inventory.slots[3]?.displayName || bot.inventory.slots[3]?.name || null,
      feet: bot.inventory.slots[2]?.displayName || bot.inventory.slots[2]?.name || null
    },
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
          
        case 'screenshot':
          await takeScreenshot(socket);
          break;
          
        case 'getViewerData':
          await getViewerData(socket);
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

async function getViewerData(socket) {
socket.emit('viewerData', {});

}

async function takeScreenshot(socket) {
  try {
    currentActivity = 'Robię zrzut ekranu';
    log('📸 Robię zrzut ekranu...');
    
    const screenshotData = {
      timestamp: new Date().toISOString(),
      position: {
        x: bot.entity.position.x,
        y: bot.entity.position.y,
        z: bot.entity.position.z
      },
      yaw: bot.entity.yaw,
      pitch: bot.entity.pitch,
      health: bot.health,
      food: bot.food,
      dimension: bot.game.dimension,
      nearby_blocks: [],
      nearby_entities: [],
      image: null
    };
    
    // Pobierz okoliczne bloki
    for (let x = -5; x <= 5; x++) {
      for (let y = -5; y <= 5; y++) {
        for (let z = -5; z <= 5; z++) {
          const block = bot.blockAt(
            bot.entity.position.offset(x, y, z)
          );
          if (block && block.type !== 0) {
            screenshotData.nearby_blocks.push({
              name: block.name,
              x: x,
              y: y,
              z: z
            });
          }
        }
      }
    }
    
    // Pobierz pobliskie graczy
    Object.values(bot.players).forEach(player => {
      if (player.entity && player.username !== bot.username) {
        screenshotData.nearby_entities.push({
          type: 'player',
          name: player.username,
          x: player.entity.position.x,
          y: player.entity.position.y,
          z: player.entity.position.z
        });
      }
    });
    
    try {
      const canvas = createCanvas(400, 400);
      const ctx = canvas.getContext('2d');
      
      // Tło
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 400, 400);
      
      // Nagłówek
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Minecraft Bot View', 10, 30);
      
      // Informacje o pozycji
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      const posText = `Pozycja: ${bot.entity.position.x.toFixed(1)}, ${bot.entity.position.y.toFixed(1)}, ${bot.entity.position.z.toFixed(1)}`;
      ctx.fillText(posText, 10, 60);
      
      const healthText = `Zdrowie: ${bot.health}/20 | Głód: ${bot.food}/20`;
      ctx.fillText(healthText, 10, 80);
      
      // Rysuj mapę bloków w prostym formacie
      ctx.fillStyle = '#444444';
      const scale = 5;
      const centerX = 200;
      const centerY = 200;
      
      // Rysuj sieć
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.5;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * scale, centerY - 10 * scale);
        ctx.lineTo(centerX + i * scale, centerY + 10 * scale);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX - 10 * scale, centerY + i * scale);
        ctx.lineTo(centerX + 10 * scale, centerY + i * scale);
        ctx.stroke();
      }
      
      // Rysuj pobliskie bloki
      screenshotData.nearby_blocks.forEach(block => {
        ctx.fillStyle = getBlockColor(block.name);
        const screenX = centerX + block.x * scale;
        const screenY = centerY + block.z * scale;
        
        if (screenX > 0 && screenX < 400 && screenY > 0 && screenY < 400) {
          ctx.fillRect(screenX - scale/2, screenY - scale/2, scale, scale);
        }
      });
      
      // Rysuj bota w centrum
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Rysuj kierunek patrzenia
      const dirX = Math.cos(bot.entity.yaw) * 8;
      const dirZ = Math.sin(bot.entity.yaw) * 8;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + dirX, centerY + dirZ);
      ctx.stroke();
      
      // Rysuj pobliskich graczy
      screenshotData.nearby_entities.forEach(entity => {
        const relX = entity.x - bot.entity.position.x;
        const relZ = entity.z - bot.entity.position.z;
        const screenX = centerX + relX * scale;
        const screenY = centerY + relZ * scale;
        
        if (screenX > 0 && screenX < 400 && screenY > 0 && screenY < 400) {
          ctx.fillStyle = '#FF6B6B';
          ctx.fillRect(screenX - 2, screenY - 2, 4, 4);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '8px Arial';
          ctx.fillText(entity.name, screenX + 5, screenY);
        }
      });
      
      // Legenda
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('Legenda:', 10, 380);
      
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(80, 368, 6, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.fillText('Bot', 88, 373);
      
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(120, 368, 6, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Gracz', 128, 373);
      
      // Konwertuj do base64
      const imageBuffer = canvas.toBuffer('image/png');
      screenshotData.image = imageBuffer.toString('base64');
      
      log('✅ Obraz wygenerowany!');
    } catch (imgError) {
      log(`⚠️ Nie udało się wygenerować obrazu: ${imgError.message}`);
    }
    
    // Wyślij zrzut do panelu
    socket.emit('screenshot', screenshotData);
    log('✅ Zrzut ekranu wysłany!');
    
    currentActivity = 'Bezczynny';
  } catch (error) {
    log(`❌ Błąd podczas robienia zrzutu: ${error.message}`);
    currentActivity = 'Bezczynny';
  }
}

// Funkcja pomocnicza do określenia koloru bloku
function getBlockColor(blockName) {
  const colors = {
    'grass_block': '#4CAF50',
    'dirt': '#8B7355',
    'stone': '#808080',
    'oak_log': '#654321',
    'oak_leaves': '#2D5016',
    'sand': '#DAA520',
    'water': '#1E90FF',
    'lava': '#FF6347',
    'oak_planks': '#CD853F',
    'cobblestone': '#696969',
    'gravel': '#A9A9A9',
    'granite': '#8B6F47',
    'diorite': '#C0C0C0',
    'andesite': '#696969',
    'tuff': '#4A4A4A',
    'deepslate': '#3A3A3A'
  };
  
  // Szukaj dopasowania
  for (let [key, color] of Object.entries(colors)) {
    if (blockName.includes(key.replace('_', ' ')) || blockName.includes(key)) {
      return color;
    }
  }
  
  // Domyślna szarość dla nieznanych bloków
  return '#666666';
}

// Start serwera web
server.listen(CONFIG.webPort, () => {
  console.log(`🌐 Panel webowy dostępny na: http://localhost:${CONFIG.webPort}`);
  console.log(`🎮 Łączę się z serwerem Minecraft: ${CONFIG.host}:${CONFIG.port}`);
});