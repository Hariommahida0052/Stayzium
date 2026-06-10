let totalRequests = 0;
let errorRequests = 0;

exports.trackRequest = (req, res, next) => {
  totalRequests++;
  next();
};

exports.trackError = () => {
  errorRequests++;
};

exports.getErrorRate = () => {
  if (totalRequests === 0) return 0;
  return ((errorRequests / totalRequests) * 100).toFixed(2);
};
