const express = require('express');
const { pool, insertarEvento, obtenerEventos, insertarEventoCounter } = require('./db');



const app = express();

// Middleware para manejar datos JSON
app.use(express.json());

// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos:', res.rows);
    }
});

// Ruta para obtener todos los eventos
app.get('/eventos', async (req, res) => {
    try {
        const eventos = await obtenerEventos();
        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Ruta para insertar un evento
app.post('/eventos', async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body); // Depuración para ver qué llega al backend
        const nuevoEvento = req.body;
        const eventoInsertado = await insertarEvento(nuevoEvento);
        res.status(201).json(eventoInsertado);
    } catch (error) {
        console.error('Error al insertar evento:', error);
        res.status(500).json({ error: 'Error al insertar evento' });
    }
});


// Ruta para insertar un evento en event_counter
app.post('/event_counter', async (req, res) => {
    try {
        console.log('Datos recibidos para event_counter:', req.body); // Depuración

        // Extraer los datos del cuerpo de la solicitud
        const { device_name, event_group, event_number, event_timestamp, session_id,user_id } = req.body;

        // Validación básica de los datos requeridos
        if (!device_name || !event_group || !event_number || !event_timestamp|| !session_id || !user_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Construir el objeto con los datos a insertar
        const eventoCounter = {
            device_name,
            event_group,
            event_number,
            event_timestamp,
            session_id: session_id || null,
            user_id: user_id || null 
        };

        // Llamar a la función existente para insertar el evento
        const query = `
            INSERT INTO event_counter (device_name, event_group, event_number, event_timestamp, session_id, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [device_name, event_group, event_number, event_timestamp, session_id, user_id];


        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al insertar evento en event_counter:', error);
        res.status(500).json({ error: 'Error al insertar evento en event_counter' });
    }
});

//Ruta para insertar una sesion
app.post('/sessions', async (req, res) => {
    try {
        const { device_name, start_time, user_id } = req.body;

        // Validación básica
        if (!device_name || !start_time || !user_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos: device_name, start_time o user_id' });
        }

        // Query para insertar la sesión en la base de datos
        const query = `
            INSERT INTO sessions (device_name, start_time, user_id)
            VALUES ($1, to_timestamp($2 / 1000.0), $3)
            RETURNING session_id;
        `;
        const values = [device_name, start_time, user_id];

        // Ejecutar la consulta
        const result = await pool.query(query, values);

        res.status(201).json({ session_id: result.rows[0].session_id });
    } catch (error) {
        console.error('Error al crear sesión:', error);
        res.status(500).json({ error: 'Error al crear sesión' });
    }
});



app.put('/sessions/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        const { end_time } = req.body;

        console.log(`Datos recibidos: session_id = ${id}, end_time = ${end_time}`);

        const query = `
            UPDATE sessions
            SET 
                end_time = to_timestamp($1 / 1000.0), -- Convertir milisegundos a TIMESTAMP
                duration = to_timestamp($1 / 1000.0) - start_time -- Calcular duración
            WHERE session_id = $2
            RETURNING session_id, start_time, end_time, duration;
        `;

        const values = [end_time, id];
        const result = await pool.query(query, values);

        console.log('Sesión finalizada correctamente:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al finalizar sesión:', error);
        res.status(500).json({ error: 'Error al finalizar sesión' });
    }
});






// Puerto del servidor
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});