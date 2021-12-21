const jwt = require('jsonwebtoken');
const User = require('../database/models/userModel');

const SECRET = "secretKey";

const createTokens = async (user) => {
    const createToken = await jwt.sign(
        {
            user: {id: user._id},
        },
        SECRET,
        {
            expiresIn: '1m',
        }
    );

    const createRefreshToken = await jwt.sign(
        {
            user: { id: user._id },
        },
        SECRET,
        {
            expiresIn: '7d',
        }
    );

  const verifyToken = jwt.decode(createToken, SECRET);
  const verifyRefresh = jwt.decode(createRefreshToken, SECRET);

  return {
      accessToken: createToken,
      refreshToken: createRefreshToken,
      accessTokenExpiredAt: verifyToken.exp * 1000,
      refreshTokenExpiredAt: verifyRefresh.exp * 1000,
  };
};

const refreshTokens = async (refreshToken) => {
    const user = await getUserByToken(refreshToken);
  
    if (user) {
        return {
            ...(await createTokens(user, SECRET)),
        }
    } else {
        return {};
    }
};

const getUserByToken = async (token) => {
    let userId = -1;
    try {
        userId = jwt.verify(token, SECRET).user.id;
    } catch (err) {
        return {};
    }

    const user = await User.findById({_id: userId});

    return user;
};

module.exports = {
    createTokens,
    refreshTokens,
    getUserByToken,
};