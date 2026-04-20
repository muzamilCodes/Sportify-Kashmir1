const resHandler = (res, statusCode, msgString, payload) => {
  const success = statusCode < 400;
  return res.status(statusCode).json({ success, message: msgString, data: payload });
};

module.exports = {resHandler}

