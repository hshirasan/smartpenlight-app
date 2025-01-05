const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ルートパス("/")にアクセスがあったら「Hello Heroku!」を返す
app.get('/', (req, res) => {
  res.send('Hello Heroku!');
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});