const { scrypt, timingSafeEqual } = require('crypto');
const { promisify } =  require('util');
const scryptAsync = promisify(scrypt);

module.exports = class Password {

    
    static async hashPassword(password) {
        const buf = await scryptAsync(password, process.env.PASSWORD_SALT, 64);
        return `${buf.toString('hex')}.${process.env.PASSWORD_SALT}`;
    }


    static async comparePassword(storedPassword, suppliedPassword)  {
    
        const [hashedPassword, salt] = storedPassword.split('.');
        const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
        const suppliedPasswordBuf = await scryptAsync(suppliedPassword, salt, 64);
        return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
        
    }
}