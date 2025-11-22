# 🏠 Deyarak

<div align="center">

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.2-47A248?logo=mongodb&logoColor=white)

**A modern real estate rental platform connecting property owners with renters**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**Deyarak** is a comprehensive Node.js web server designed for the real estate industry. It facilitates direct property rental transactions between property owners and renters, eliminating intermediaries and streamlining the rental process.

This project was developed as a graduation project, implementing modern web development practices and industry-standard security measures.

<div align="center">
    <img src="https://res.cloudinary.com/dptpklbgm/image/upload/v1720920441/logos/lcqyngrh4rtnamfofenb.png" alt="Deyarak Logo" width="500"/>
</div>

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based authentication with password hashing
- 🏘️ **Property Management** - Complete CRUD operations for property listings
- 💳 **Payment Integration** - Stripe integration for secure payment processing
- 📧 **Email Notifications** - Automated email notifications via SendGrid
- 📸 **Image Upload** - Cloudinary integration for property image storage
- ⭐ **Review System** - User reviews and ratings for properties
- 📞 **Contact Management** - Contact form and inquiry system
- 📚 **API Documentation** - Swagger/OpenAPI documentation
- 🧪 **Testing** - Comprehensive test suite with Jasmine
- 🛡️ **Security** - Rate limiting, data sanitization, and security headers

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Architecture**: MVC (Model-View-Controller)

### Database
- **Database**: MongoDB
- **ODM**: Mongoose

### Authentication & Security
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Security Middleware**: Helmet, express-rate-limit, express-mongo-sanitize, HPP

### Services & Integrations
- **Image Storage**: Cloudinary
- **Email Service**: SendGrid (Production), Mailtrap (Development)
- **Payment Processing**: Stripe
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)

### Testing
- **Testing Framework**: Jasmine
- **HTTP Testing**: Supertest

### Additional Tools
- **Image Processing**: Sharp
- **File Upload**: Multer
- **Email Templates**: Pug
- **Logging**: Morgan
- **Validation**: Validator

---

## 🏗️ Architecture

<div align="center">
    <img src="https://res.cloudinary.com/dptpklbgm/image/upload/v1720922994/logos/tfirzwtlkvn9creaqmzd.jpg" alt="Architecture Diagram" width="800"/>
</div>

The application follows the **MVC (Model-View-Controller)** architectural pattern:

- **Models**: Data schemas and business logic (MongoDB/Mongoose)
- **Views**: Email templates (Pug templates)
- **Controllers**: Request handling and business logic
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, error handling, security

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/7ossam7atem1/Deyarak.git
cd Deyarak
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example` if available) and configure the environment variables (see [Environment Variables](#-environment-variables) section below).

### 4. Start the Development Server

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 2000).

### 5. Access the Application

- **API Base URL**: `http://localhost:2000/api/v1`
- **API Documentation**: `http://localhost:2000/api-docs`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Application Configuration
```env
NODE_ENV=development
PORT=2000
```

### Database Configuration
```env
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/database-name
DATABASE_PASSWORD=your-database-password
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```

### Email Configuration (Development - Mailtrap)
```env
EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_FROM=noreply@deyarak.com
```

### Email Configuration (Production - SendGrid)
```env
SENDGRID_USERNAME=your-sendgrid-username
SENDGRID_PASSWORD=your-sendgrid-api-key
```

### Payment Configuration (Stripe)
```env
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Cloudinary Configuration
```env
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

> ⚠️ **Important**: Never commit your `.env` file to version control. Add it to your `.gitignore` file.

---

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**Live Documentation**: [https://deyarak-app.onrender.com/api-docs/](https://deyarak-app.onrender.com/api-docs/)

### API Endpoints

The API is organized into the following main routes:

- **Properties**: `/api/v1/properties` - Property management endpoints
- **Users**: `/api/v1/users` - User authentication and management
- **Reviews**: `/api/v1/reviews` - Property reviews and ratings
- **Rentings**: `/api/v1/rentings` - Rental transactions and payments
- **Contacts**: `/api/v1/contacts` - Contact form submissions

For detailed endpoint documentation, visit the Swagger UI interface.

---

## 🧪 Testing

Run the test suite using Jasmine:

```bash
npm test
```

Or directly with:

```bash
npx jasmine
```

The test suite includes:
- Unit tests for controllers
- Integration tests for API endpoints
- Authentication and authorization tests

---

## 🚢 Deployment

### Production Build

To run the application in production mode:

```bash
npm run start:prod
```

### Deployment Platform

This application is deployed on **Render**:

<div align="center">
    <img src="https://res.cloudinary.com/dptpklbgm/image/upload/v1720923848/logos/a3nsvefdhej2deyx5dsh.jpg" alt="Render Deployment" width="600"/>
</div>

### Deployment Checklist

- [ ] Set all required environment variables in your hosting platform
- [ ] Ensure MongoDB connection string is configured
- [ ] Configure production email service (SendGrid)
- [ ] Set up Stripe production keys
- [ ] Configure Cloudinary production settings
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domain

---

## 📁 Project Structure

```
Deyarak/
├── controllers/          # Request handlers and business logic
│   ├── authController.js
│   ├── contactController.js
│   ├── errorController.js
│   ├── factoryHandler.js
│   ├── propertyController.js
│   ├── rentingController.js
│   ├── reviewController.js
│   └── userController.js
├── models/              # MongoDB schemas and models
│   ├── contactModel.js
│   ├── propertyModel.js
│   ├── rentingModel.js
│   ├── reviewModel.js
│   └── userModel.js
├── routes/              # API route definitions
│   ├── contactRoutes.js
│   ├── paymentRoutes.js
│   ├── propertyRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── utils/               # Utility functions and helpers
│   ├── apiMaestro.js
│   ├── appError.js
│   ├── catchAsyncronization.js
│   ├── cloudinary.js
│   ├── email.js
│   ├── swagger.js
│   └── swagger.json
├── views/               # Email templates (Pug)
│   └── email/
│       ├── _style.pug
│       ├── baseEmail.pug
│       ├── passwordReset.pug
│       └── welcome.pug
├── public/              # Static files
│   ├── img/
│   ├── success.css
│   └── success.html
├── spec/                # Test specifications
│   ├── apiSpec.js
│   └── support/
│       └── jasmine.json
├── dev-data/            # Development data and scripts
│   ├── customScript.js
│   └── property.json
├── app.js               # Express application setup
├── server.js            # Server entry point
└── package.json         # Project dependencies
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

---

## 👤 Author

**Hossam Hatem**

- GitHub: [@7ossam7atem1](https://github.com/7ossam7atem1)
- Project Link: [https://github.com/7ossam7atem1/Deyarak](https://github.com/7ossam7atem1/Deyarak)

---

## 🙏 Acknowledgments

- **Supervisor**: Prof. Dr. Mahmoud Hussien
- **Institution**: Faculty of computers and information

---
