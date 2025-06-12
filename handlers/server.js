const path = require('path');
const express = require('express');
const app = express();

// Lấy port từ biến môi trường do Render cung cấp, nếu không có thì fallback về 3000 (local)
const port = process.env.PORT || 1000;

app.get('/', (req, res) => {
  // Trả về file index.html nằm cùng thư mục với server.js
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`🔗 Server listening on port ${port}`);
});
