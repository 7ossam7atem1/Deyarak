const swaggerJSDoc = require('swagger-jsdoc');
const swaggerConfig = require('./swagger.json');

const options = {
  openapi: '3.1.0',
  info: {
    title: 'Deyarak-App APIs',
    description: 'API guide documentation for Deyarak-App Backend server',
    version: '1.0.0',
    contact: {
      name: 'Hossam Hatem Ragab',
      email: '7ossam7atem1@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:2000/',
      description: 'Local Server',
    },
    {
      url: 'https://deyarak-app.onrender.com/',
      description: 'Render Server',
    },
  ],
};

swaggerConfig.openapi = options.openapi;
swaggerConfig.info = options.info;
swaggerConfig.servers = options.servers;

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: swaggerConfig,
  apis: ['./routes/*.js'],
});

module.exports = swaggerSpec;
