const { scrypt, timingSafeEqual } = require('crypto');
const { promisify } =  require('util');
const scryptAsync = promisify(scrypt);

module.exports = class Password {

    static async comparePassword(storedPassword, suppliedPassword)  {
    
        const [hashedPassword, salt] = storedPassword.split('.');
        const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
        const suppliedPasswordBuf = await scryptAsync(suppliedPassword, salt, 64);
        return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
        
    }
}