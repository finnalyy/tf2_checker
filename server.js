const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

const DATA_PATH = './known_ids.json';

app.use(cors());
app.use(express.json());

app.get('/known_ids.json', async (req, res) => {
  try {
    const data = await fs.readJson(DATA_PATH);
    res.json(data);
  } catch (err) {
    res.status(500).send('Ошибка чтения JSON');
  }
});

app.post('/save/:id', async (req, res) => {
  const id = req.params.id;
  const userData = req.body;

  try {
    const data = await fs.readJson(DATA_PATH);
    data[id] = userData;
    await fs.writeJson(DATA_PATH, data, { spaces: 2 });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Ошибка сохранения');
  }
});

app.post('/comment/:id', async (req, res) => {
  const id = req.params.id;
  const { comment } = req.body;

  try {
    const data = await fs.readJson(DATA_PATH);
    if (!data[id]) return res.status(404).send('User not found');
    data[id].comment = comment;
    await fs.writeJson(DATA_PATH, data, { spaces: 2 });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Ошибка комментария');
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
