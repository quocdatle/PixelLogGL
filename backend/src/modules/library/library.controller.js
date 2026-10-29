const libraryService = require('./library.service');
const { success } = require('../../utils/responseFormatter');

async function list(req, res, next) {
  try {
    const result = await libraryService.list(req.userId, req.query);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function summary(req, res, next) {
  try {
    const result = await libraryService.summary(req.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const { rawgId, status } = req.body;
    const entry = await libraryService.add(req.userId, { rawgId, status });
    return success(res, entry, 201);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const entry = await libraryService.getOne(req.userId, req.params.id);
    return success(res, entry);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const entry = await libraryService.update(req.userId, req.params.id, req.body);
    return success(res, entry);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await libraryService.remove(req.userId, req.params.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function addPlaySession(req, res, next) {
  try {
    const { minutes, playedAt, note } = req.body;
    const entry = await libraryService.addPlaySession(req.userId, req.params.id, { minutes, playedAt, note });
    return success(res, entry, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, summary, add, getOne, update, remove, addPlaySession };
