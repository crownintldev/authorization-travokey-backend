module.exports = (fn) => {

  const log = console.log;

  return (req, res, next) => {
    fn(req, res, next).catch((e) => {
      log(("===== catchAsync e =======", e));
      next(e);
    });
  };
};
