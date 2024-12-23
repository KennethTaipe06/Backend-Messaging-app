const express = require('express');
const app = express();
const http = require('http').createServer(app);
const swaggerUI = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Permite todas las conexiones
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
    allowEIO3: true
});
const cors = require('cors');

app.use(cors({
    origin: '*', // Permite todas las conexiones
    credentials: true
}));
app.use(express.json());
// Agregar esta línea para servir archivos estáticos
app.use(express.static('public'));

// Configuración Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Verifica el estado del servidor
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Server is running"
 */
app.get('/status', (req, res) => {
    res.json({ status: 'Server is running' });
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene la lista de usuarios conectados
 *     responses:
 *       200:
 *         description: Lista de usuarios conectados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   nombre:
 *                     type: string
 */
app.get('/usuarios', (req, res) => {
    res.json(Array.from(usuarios));
});

const PORT = process.env.PORT || 3000;

// Almacenar usuarios conectados
const usuarios = new Set();

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Manejar nuevo usuario
    socket.on('unirse', (nombreUsuario) => {
        usuarios.add({
            id: socket.id,
            nombre: nombreUsuario
        });
        
        // Enviar mensaje de bienvenida al grupo
        io.emit('mensaje', {
            usuario: 'Sistema',
            texto: `${nombreUsuario} se ha unido al chat`
        });
        
        // Actualizar lista de usuarios
        io.emit('usuarios', Array.from(usuarios));
    });

    // Manejar mensajes
    socket.on('enviarMensaje', (mensaje) => {
        io.emit('mensaje', mensaje);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        const usuario = Array.from(usuarios).find(u => u.id === socket.id);
        if (usuario) {
            usuarios.delete(usuario);
            io.emit('mensaje', {
                usuario: 'Sistema',
                texto: `${usuario.nombre} ha abandonado el chat`
            });
            io.emit('usuarios', Array.from(usuarios));
        }
    });
});

http.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
