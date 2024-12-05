import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  // Decode the token to inspect the payload
  const decodedToken = jwt.decode(token); // Get the payload directly
  console.log('Decoded Token:', decodedToken);
  
  return token;
};
