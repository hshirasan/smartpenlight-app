const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentColor = '#FFFFFF'; // 現在の色
let mode = 'steady'; // 現在の点滅モード

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

// HTMLファイルのルートを指定
app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

// WebSocketの処理
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('changeSettings', (settings) => {
    console.log('Settings changed:', settings);
    currentColor = settings.color;
    mode = settings.mode;
  });

  // 接続時に現在の状態を送信
  socket.emit('updateBlink', { isOn: true, color: currentColor });
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});