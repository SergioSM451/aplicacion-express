
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Asegúrate de que esta línea se agrega


const app = express();


app.use(cors()); 


const jsonParser = bodyParser.json();


let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla tareas creada o ya existente.');
        }
    });
});


app.post('/insert', jsonParser, (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({ error: 'Falta información necesaria' });
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');
    stmt.run(todo, function(err) {
        if (err) {
            console.error("Error en el stmt:", err);
            return res.status(500).json({ error: 'Error al insertar la tarea' });
        }
        console.log("Tarea agregada exitosamente!");
        res.status(201).json({ id: this.lastID }); // Responde con el ID del nuevo registro
    });
    stmt.finalize();
});


app.get('/todos', (req, res) => {
    db.all('SELECT id, todo, created_at FROM todos ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error("Error al obtener todos:", err);
            return res.status(500).json({ error: 'Error al obtener la lista de tareas' });
        }
        res.json(rows);
    });
});


app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});


const port = 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
