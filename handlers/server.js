const path = require('path');
const express = require('express');
const app = express();

// Dùng port của Render hoặc fallback về 3000 khi chạy local
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  // Gửi file index.html (bạn nhớ để index.html cùng thư mục với server.js)
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`🔗 Server listening on port ${port}`);
});
