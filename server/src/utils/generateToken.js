import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  // Access Token (Short-lived, e.g. 15 minutes)
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Refresh Token (Long lifespan, e.g. 7 days - adjust to your needs)
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const sendTokenResponse = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  // Remove password from json output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    accessToken,
    user,
  });
};
