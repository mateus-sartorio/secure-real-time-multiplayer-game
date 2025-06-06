require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { getRandomPosition, getRandomNumber } = require('./utils.js');
const { uuid } = require('uuidv4');
const {
  PLAYER_SIZE,
  COLLECTIBLE_SIZE,
  INDEX_TO_COLLECTIBLE_VALUE_MAP
} = require('./constants.js');

const app = express();
const server = createServer(app);
const io = socket(server);

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({origin: '*'})); 

// Index page (static HTML)
app
  .route('/')
  .get(function (_req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 
    
// 404 Not Found Middleware
app.use(function(_req, res) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

let playerList = [];
let collectiblesList = [];

setInterval(() => {
  if(collectiblesList.length < 20 && collectiblesList.length < 5 * playerList.length) {
    collectiblesList.push({
      id: uuid(),
      ...getRandomPosition(COLLECTIBLE_SIZE),
      value: INDEX_TO_COLLECTIBLE_VALUE_MAP(getRandomNumber({ min: 1, max: 35 }))
    });

    io.emit('collectibles-list', collectiblesList);
  }
}, 1000);

io.on('connection', socket => {
  console.log('A user has connected');

  const newPlayer = { id: socket.id, ...getRandomPosition(PLAYER_SIZE), score: 0, playerImageIndex: getRandomNumber({ min: 1, max: 9 }) };
  playerList.push(newPlayer);

  io.emit('collectibles-list', collectiblesList);
  io.emit('player-list', playerList);
  socket.emit('update-player', newPlayer);

  socket.on('disconnect', () => {
    console.log('A user has disconnected');
  
    playerList = playerList.filter(player => player.id !== socket.id);
  
    io.emit('player-list', playerList);
  });

  socket.on('player-move', (payload) => {
    playerList = playerList.map(player => player.id !== socket.id ? player : { ...payload });
    io.emit('player-list', playerList);
    socket.emit('update-player', payload);
  });

  socket.on('collect', (payload) => {
    collectiblesList = collectiblesList.filter(collectible => collectible.id !== payload.id);
    io.emit('collectibles-list', collectiblesList);
  });
});

// Set up server
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
});

module.exports = app;