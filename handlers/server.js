const path = require('path');
const express = require("express");
const app = express();

const port = process.env.PORT || 3000; // SỬA CHỖ NÀY

app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

app.listen(port, () => {
    console.log(`🔗 Listening on http://localhost:${port}`);
});
