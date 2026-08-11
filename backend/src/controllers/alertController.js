const AlertDismissal = require('../models/AlertDismissal')

exports.listDismissals = async (req, res) => {
  try {
    const dismissals = await AlertDismissal.list(req)
    res.json(dismissals)
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 500).json({ error: error.message })
  }
}

exports.dismissAlert = async (req, res) => {
  try {
    const dismissal = await AlertDismissal.dismiss(req, req.body)
    res.status(201).json(dismissal)
  } catch (error) {
    res.status(error.code === 'PGRST301' ? 401 : 400).json({ error: error.message })
  }
}
