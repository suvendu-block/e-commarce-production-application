import JWT from 'jsonwebtoken'

// Signs a JWT with the user's id, expires in 30 days
const genrateToken = (id) => {
    return JWT.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export default genrateToken;