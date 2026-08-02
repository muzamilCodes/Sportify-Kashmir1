const resHandler = (res, statusCode, msgString, payload) => {
  return res.status(statusCode).json({ message: msgString, payload });
};

module.exports = {resHandler}

