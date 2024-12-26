const { insertarEvento, obtenerEventos } = require('./db');

const probarCrud = async () => {
    try {
        // Insertar un nuevo evento
        const nuevoEvento = {
            dispositivo_id: '12345',
            tipo_evento: 'aceleración',
            datos: JSON.stringify({ x: 1.23, y: 4.56, z: 7.89 }),
        };
        const eventoInsertado = await insertarEvento(nuevoEvento);
        console.log('Evento insertado:', eventoInsertado);

        // Obtener todos los eventos
        const eventos = await obtenerEventos();
        console.log('Eventos obtenidos:', eventos);
    } catch (error) {
        console.error('Error al realizar CRUD:', error);
    }
};

probarCrud();
