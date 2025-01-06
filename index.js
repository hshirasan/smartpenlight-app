const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode'); // QRコード生成ライブラリを追加

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let isOn = false;
let blinkTimer;

app.get('/host', (req, res) => {
  res.sendFile(__dirname + '/host.html');
});

app.get('/client', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});

// QRコード生成エンドポイント
app.get('/qrcode', (req, res) => {
  const url = req.query.url || 'http://example.com'; // クエリパラメータからURLを取得
  QRCode.toDataURL(url, (err, qr) => {
    if (err) {
      console.error('Failed to generate QR code:', err);
      res.status(500).send('Error generating QR code');
    } else {
      res.send(`<img src="${qr}" alt="QR Code"><p>URL: <a href="${url}">${url}</a></p>`);
    }
  });
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('changeSettings', (settings) => {
    console.log('Settings change:', settings);

    if (blinkTimer) clearInterval(blinkTimer);
    const { mode, color } = settings;

    if (mode === 'steady') {
      isOn = true;
      io.emit('updateBlink', { isOn, color });
    } else if (mode === 'pattern1') {
      let short = true;
      blinkTimer = setInterval(() => {
        isOn = !isOn;
        io.emit('updateBlink', { isOn, color });
        clearInterval(blinkTimer);
        blinkTimer = setInterval(() => {
          isOn = !isOn;
          io.emit('updateBlink', { isOn, color });
        }, short ? 300 : 200);
        short = !short;
      }, 200);
    } else if (mode === 'pattern2') {
      blinkTimer = setInterval(() => {
        isOn = !isOn;
        io.emit('updateBlink', { isOn, color });
      }, isOn ? 200 : 800);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
