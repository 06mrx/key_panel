import bcrypt from 'bcrypt';

async function generateHash() {
    const password = 'hackermrx';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
}

generateHash(); 