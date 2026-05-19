function handleError(res, err) {
  if (err.status) {
    return res.status(err.status).json({ error: true, message: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: true, message: 'Internal server error' });
}

module.exports = { handleError };
