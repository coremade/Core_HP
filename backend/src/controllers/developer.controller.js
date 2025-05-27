const { Developer } = require("../models");

exports.getAllDevelopers = async (req, res, next) => {
  try {
    const developers = await Developer.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json(developers);
  } catch (err) {
    next(err);
  }
};

exports.getDeveloperById = async (req, res, next) => {
  try {
    const developer = await Developer.findByPk(req.params.id);
    if (!developer) {
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }
    res.json(developer);
  } catch (err) {
    next(err);
  }
};

exports.createDeveloper = async (req, res, next) => {
  try {
    const developer = await Developer.create(req.body);
    res.status(201).json(developer);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "이미 등록된 이메일입니다." });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
    }
    next(err);
  }
};

exports.updateDeveloper = async (req, res, next) => {
  try {
    const [updated] = await Developer.update(req.body, {
      where: { developer_id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }
    const developer = await Developer.findByPk(req.params.id);
    res.json(developer);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "이미 등록된 이메일입니다." });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
    }
    next(err);
  }
};

exports.deleteDeveloper = async (req, res, next) => {
  try {
    const deleted = await Developer.destroy({
      where: { developer_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
