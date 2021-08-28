const hello = (req, res) => {
  console.log(req.isUser);
  return "Hello World";
};

export { hello as default };
