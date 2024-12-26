require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const { Pool } = require('pg');

// Configuración de la conexión usando variables de entorno
const pool = new Pool({
    user: process.env.DB_USER || 'postgres', // Usuario de PostgreSQL
    host: process.env.DB_HOST || 'localhost', // Dirección del servidor
    database: process.env.DB_NAME || 'pulsare_app', // Nombre de la base de datos
    password: process.env.DB_PASSWORD || 'postgres', // Contraseña
    port: process.env.DB_PORT || 5432, // Puerto por defecto
});

// Función para insertar un evento
const insertarEvento = async (evento) => {
    const { dispositivo_id, tipo_evento, datos } = evento;
    const query = `
        INSERT INTO eventos (dispositivo_id, tipo_evento, datos)
        VALUES ($1, $2, $3) RETURNING *;
    `;
    const values = [dispositivo_id, tipo_evento, datos];
    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (error) {
        console.error('Error al insertar evento en la base de datos:', error);
        throw error;
    }
};

// Función para obtener todos los eventos
const obtenerEventos = async () => {
    const query = 'SELECT * FROM eventos ORDER BY fecha DESC;';
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        throw error;
    }
};

// Función para insertar eventos en la tabla event_counter
const insertarEventoCounter = async (evento) => {
    const { device_name, event_group, event_number, event_timestamp } = evento;
    const query = `
        INSERT INTO event_counter (device_name, event_group, event_number, event_timestamp)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [device_name, event_group, event_number, event_timestamp];
    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (error) {
        console.error('Error al insertar evento en event_counter:', error);
        throw error;
    }
};

// Exportar pool y las funciones
module.exports = {
    pool, // Exporta el pool
    insertarEvento,
    obtenerEventos,
    insertarEventoCounter,
};