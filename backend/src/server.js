const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Ilé Ẹwà API démarrée sur http://localhost:${PORT}`);
});
