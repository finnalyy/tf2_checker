const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db');

// Создание таблицы при первом запуске
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      data TEXT,
      comment TEXT
    )
  `);
});

// Получение всех ID
app.get('/known_ids.json', (req, res) => {
  db.all('SELECT id, data, comment FROM users', [], (err, rows) => {
    if (err) return res.status(500).send('Ошибка чтения БД');
    const result = {};
    rows.forEach(row => {
      result[row.id] = {
        ...(JSON.parse(row.data || '{}')),
        ...(row.comment ? { comment: row.comment } : {})
      };
    });
    res.json(result);
  });
});

// Сохранение данных по ID
app.post('/save/:id', (req, res) => {
  const id = req.params.id;
  const userData = JSON.stringify(req.body);

  db.run(
    `INSERT INTO users (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
    [id, userData],
    err => {
      if (err) return res.status(500).send('Ошибка сохранения');
      res.send({ success: true });
    }
  );
});

// Добавление/обновление комментария
app.post('/comment/:id', (req, res) => {
  const id = req.params.id;
  const { comment } = req.body;

  db.run(
    `UPDATE users SET comment = ? WHERE id = ?`,
    [comment, id],
    function (err) {
      if (err) return res.status(500).send('Ошибка комментария');
      if (this.changes === 0) return res.status(404).send('User not found');
      res.send({ success: true });
    }
  );
});

app.get('/data', (req, res) => {
  db.all('SELECT id, data, comment FROM users', [], (err, rows) => {
    if (err) return res.status(500).send('Ошибка чтения БД');
    const result = [];
    rows.forEach(row => {
      const userData = JSON.parse(row.data || '{}');
      result.push({
        steamid64: row.id,
        ...userData,
        comment: row.comment || ''
      });
    });
    res.json(result);
  });
});


// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
