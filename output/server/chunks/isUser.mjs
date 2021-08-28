const isUser = async (req, res) => {
  req.isUser = true;
};

export { isUser as default };
