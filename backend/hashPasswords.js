// backend/hashPasswords.js
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function generateHashedPasswords() {
    console.log("Generating hashed passwords for common test passwords:");
    const testPasswords = [
        "password123",
        "doctorpass",
        "adminpass",
        "securetest"
    ];

    for (const pass of testPasswords) {
        const hashedPassword = await hashPassword(pass);
        console.log(`Original: "${pass}" -> Hashed: "${hashedPassword}"`);
    }
    console.log("\nUse these hashed passwords in your users.json file.");
}

generateHashedPasswords();
