const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentColor = '#FFFFFF'; // 現在の色
let mode = 'steady'; // 現在の点滅モード

// 点滅のタイミングを絶対時間で計算
const getNextBlinkState = () => {
  const now = Date.now();
  const cycleTime = mode === 'pattern1' ? 500 : mode === 'pattern2' ? 1000 : 0; // 周期: 500ms または 1000ms
  if (cycleTime === 0) return true; // 常時点灯
  return Math.floor((now % cycleTime) / (cycleTime / 2)) === 0;
};

// 定期的にクライアントに状態を送信
setInterval(() => {
  const isOn = getNextBlinkState();
  const data = {
    isOn: mode === 'fade' ? true : isOn,
    color: currentColor,
    brightness: mode === 'fade' ? fadeProgress : 1
  };
  console.log('Broadcasting data to clients:', data); // デバッグ用
  io.emit('updateBlink', data);
}, 50); // 50msごとに同期状態を送信

app.get('/host', (req, res) => {
  res.sendFile(__dirname + '/host.html');
});

app.get('/client', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});

// WebSocket接続
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('changeSettings', (settings) => {
    console.log('Settings changed:', settings);
    currentColor = settings.color;
    mode = settings.mode;
  });

  // 接続時に現在の状態を送信
  socket.emit('updateBlink', { isOn: getNextBlinkState(), color: currentColor });
});

// ポート設定 (Renderで動的ポートを使用)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
