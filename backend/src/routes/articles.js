const express = require('express');
const router = express.Router();

// Placeholder para rutas de artículos
router.get('/', (req, res) => {
  res.json({ message: 'Articles routes - To be implemented' });
});

module.exports = router;
