const { analyzeUser, getAllProfiles, getProfile } = require('../services/profile.service');

async function analyzeProfile(req, res, next) {
  try {
    const { username } = req.params;
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return res.status(400).json({ error: 'Invalid username' });
    }
    const result = await analyzeUser(username);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listProfiles(req, res, next) {
  try {
    const profiles = await getAllProfiles();
    res.status(200).json({ count: profiles.length, profiles });
  } catch (err) {
    next(err);
  }
}

async function getSingleProfile(req, res, next) {
  try {
    const { username } = req.params;
    const data = await getProfile(username);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeProfile, listProfiles, getSingleProfile };
