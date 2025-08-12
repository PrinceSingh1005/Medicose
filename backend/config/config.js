module.exports = {
    email: {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || 'your@email.com',
        password: process.env.EMAIL_PASS || 'password',
        from: process.env.EMAIL_FROM || 'no-reply@clinic.com'
    },
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};