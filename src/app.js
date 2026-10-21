const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuración con las credenciales exactas de docker-compose
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'usuario',
  password: process.env.DB_PASSWORD || 'clave',
  database: process.env.DB_NAME || 'holamundo_db'
};

let db;

function handleDisconnect() {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.log('Esperando a que MySQL inicialice... Reintentando en 3 segundos.');
      setTimeout(handleDisconnect, 3000);
    } else {
      console.log('Conectado a MySQL con éxito');
    }
  });

  db.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.get('/', (req, res) => {
  db.query('SELECT NOW() AS fecha_actual', (err, results) => {
    if (err) {
      return res.status(500).send('Esperando inicio de la base de datos MySQL... Recarga la página en 5 segundos.');
    }
    res.send(`
      <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
        <h1 style="color: #2c3e50;">¡Hola Mundo desde Node.js + MySQL con Docker Compose!</h1>
        <p><strong>Estudiante:</strong> Yhadel Lopez | <strong>Matrícula:</strong> 20242493</p>
        <p style="background: #e8f8f5; display: inline-block; padding: 10px 20px; border-radius: 5px; color: #16a085;">
          <strong>Fecha/Hora reportada por MySQL:</strong> ${results[0].fecha_actual}
        </p>
      </div>
    `);
  });
});

app.listen(port, () => {
  console.log(`Servidor activo en el puerto ${port}`);
});