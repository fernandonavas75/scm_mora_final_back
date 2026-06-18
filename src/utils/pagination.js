const getPagination = (page = 1, limit = 20) => {
  const currentPage = Math.max(Number(page), 1);
  const currentLimit = Math.max(Number(limit), 1);
  const offset = (currentPage - 1) * currentLimit;

  return {
    page: currentPage,
    limit: currentLimit,
    offset,
  };
};

module.exports = {
  getPagination,
};