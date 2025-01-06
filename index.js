const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentColor = '#FFFFFF'; // 現在の色
let mode = 'steady'; // 現在の点滅モード
let fadeProgress = 0; // フェード進行度 (0 ～ 1)

// 点灯状態の計算
const getNextBlinkState = () => {
  const now = Date.now();
  if (mode === 'fade') {
    const totalCycleTime = 3000; // 全体のサイクル時間 (1000ms フェードイン + 1000ms キープ + 1000ms フェードアウト)
    const currentPhase = now % totalCycleTime;

    if (currentPhase < 1000) {
      // フェードイン (0 ～ 1)
      fadeProgress = currentPhase / 1000;
    } else if (currentPhase < 2000) {
      // 最大輝度 (1)
      fadeProgress = 1;
    } else {
      // フェードアウト (1 ～ 0)
      fadeProgress = 1 - (currentPhase - 2000) / 1000;
    }

    return fadeProgress; // 輝度を返す
  }
  const cycleTime = mode === 'pattern1' ? 500 : mode === 'pattern2' ? 1000 : 0;
  if (cycleTime === 0) return true;
  return Math.floor((now % cycleTime) / (cycleTime / 2)) === 0;
};

// 定期的にクライアントに状態を送信
setInterval(() => {
  const isOn = getNextBlinkState();
  io.emit('updateBlink', {
    isOn: mode === 'fade' ? true : isOn, // フェード中は常に true
    color: currentColor,
    brightness: mode === 'fade' ? fadeProgress : 1 // フェード時は輝度を送信
  });
}, 50);

app.get('/host', (req, res) => {
  res.sendFile(__dirname + '/host.html');
});

app.get('/client', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('changeSettings', (settings) => {
    console.log('Settings changed:', settings);
    currentColor = settings.color;
    mode = settings.mode;
  });

  socket.emit('updateBlink', { isOn: getNextBlinkState(), color: currentColor });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
