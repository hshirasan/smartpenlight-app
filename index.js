<!DOCTYPE html>
<html>
<head>
  <title>Host Control</title>
</head>
<body>
  <h1>Host Control</h1>

  <h2>色の選択</h2>
  <form id="colorForm">
    <label><input type="radio" name="color" value="#FF0000" checked> 赤</label><br>
    <label><input type="radio" name="color" value="#0000FF"> 青</label><br>
    <label><input type="radio" name="color" value="#00FF00"> 緑</label><br>
    <label><input type="radio" name="color" value="#FFFF00"> 黄</label><br>
    <label><input type="radio" name="color" value="#FFC0CB"> 桃</label><br>
    <label><input type="radio" name="color" value="#800080"> 紫</label><br>
    <label><input type="radio" name="color" value="#FFFFFF"> 白</label><br>
  </form>

  <h2>点灯パターン</h2>
  <form id="modeForm">
    <label><input type="radio" name="mode" value="steady" checked> 常時点灯</label><br>
    <label><input type="radio" name="mode" value="pattern1"> 500ms 点灯 + 500ms 消灯</label><br>
    <label><input type="radio" name="mode" value="pattern2"> 1000ms 点灯 + 1000ms 消灯</label><br>
  </form>

  <button id="sendBtn">送信</button>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    document.getElementById('sendBtn').onclick = () => {
      const selectedColor = document.querySelector('input[name="color"]:checked');
      const selectedMode = document.querySelector('input[name="mode"]:checked');
      if (selectedColor && selectedMode) {
        socket.emit('changeSettings', {
          color: selectedColor.value,
          mode: selectedMode.value
        });
      } else {
        alert("色とパターンを選択してください！");
      }
    };
  </script>
</body>
</html>
