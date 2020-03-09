const jwt = require('jsonwebtoken');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

/*Verify Token*/
function verifyToken(req, res, next) {
  const headers = req.get('Authorization');
  const decoded = fs.readFileSync('Middlewares/private.key', 'utf8');
  jwt.verify(headers, decoded, (err, decoded) => {
    if (err) {
      next(new Error('Token invalid'));
      return res
        .status(200)
        .json({ ok: false, message: 'Something went wrong with the server' });
    }
    if (!decoded) {
      return res.status(200).json({ ok: false, message: 'Ivalid token' });
    }
    const payload = decoded;
    req.user = payload;
  });
  next();
}
function roleAuth(req, res, next) {
  const user = req.user;
  if (user.role === 'ADMIN') {
    next();
  } else {
    next('You dont have permission to do this action');
  }
}

async function verify(token) {
  const credentials = fs.readFileSync('Middlewares/credentials.json', 'utf8');
  const parsedClient = JSON.parse(credentials);
  const client_id = parsedClient.web.client_id;
  const client = new OAuth2Client(client_id);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id
  });
  const payload = ticket.getPayload();
  return payload;
}

module.exports = {
  verifyToken,
  roleAuth,
  verify
};
