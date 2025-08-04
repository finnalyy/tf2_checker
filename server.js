const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JSON_PATH = path.join(__dirname, 'known_ids.json');

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(JSON_PATH)) {
  fs.writeFileSync(JSON_PATH, '{}');
}

app.get('/known_ids.json', (req, res) => {
  fs.readFile(JSON_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Ошибка чтения файла' });
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.post('/update', (req, res) => {
  const newUsers = req.body;
  if (typeof newUsers !== 'object') return res.status(400).json({ error: 'Неверный формат данных' });

  fs.readFile(JSON_PATH, 'utf8', (err, data) => {
    let existingData = {};
    if (!err && data) {
      try {
        existingData = JSON.parse(data);
      } catch (e) {
        return res.status(500).json({ error: 'Ошибка парсинга существующего JSON' });
      }
    }

    const updated = { ...existingData, ...newUsers };

    fs.writeFile(JSON_PATH, JSON.stringify(updated, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка записи в файл' });
      res.json({ success: true, message: 'Данные обновлены успешно' });
    });
  });
});

app.listen(PORT, () => {
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  if (isRailway) {
    console.log(`🌍 Railway URL будет выглядеть как: https://tf2-checker.up.railway.app`);
  } else {
    console.log(`🧪 Локально: http://localhost:${PORT}`);
  }
});
