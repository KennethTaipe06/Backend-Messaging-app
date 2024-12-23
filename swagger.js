const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Chat Grupal',
            version: '1.0.0',
            description: 'API para chat grupal con websockets',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./server.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);
