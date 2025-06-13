const express = require("express");
const router = express.Router();
const { Notice } = require("../models");

// 모든 요청에 대한 로깅 미들웨어
router.use((req, res, next) => {
  console.log('Notice Routes - 요청 발생:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  next();
});

// 공지사항 목록 조회
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [
        ['notice_id', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
    res.status(200).json(notices);
  } catch (error) {
    console.error('공지사항 목록 조회 실패:', error);
    res.status(500).json({ message: '공지사항 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 공지사항 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    await notice.increment('views');
    // 증가된 값을 다시 조회
    const updatedNotice = await Notice.findByPk(req.params.id);
    res.status(200).json(updatedNotice);
  } catch (error) {
    console.error('공지사항 상세 조회 실패:', error);
    res.status(500).json({ message: '공지사항 상세 조회 중 오류가 발생했습니다.' });
  }
});

// 공지사항 작성
router.post("/", async (req, res) => {
  try {
    const { title, content, is_important, author } = req.body;
    // 현재 최대 notice_id 조회
    const maxNotice = await Notice.findOne({
      order: [['notice_id', 'DESC']]
    });
    const nextId = maxNotice ? Number(maxNotice.notice_id) + 1 : 1;

    const notice = await Notice.create({
      notice_id: nextId,
      title,
      content,
      author: author || '관리자',
      is_important,
      views: 0
    });

    res.status(201).json(notice);
  } catch (error) {
    console.error('공지사항 작성 실패:', error);
    res.status(500).json({ message: '공지사항 작성 중 오류가 발생했습니다.' });
  }
});

// 공지사항 수정
router.put("/:id", async (req, res) => {
  try {
    const { title, content, is_important, author } = req.body;
    const notice = await Notice.findByPk(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    await notice.update({
      title,
      content,
      is_important,
      author: author || notice.author
    });

    res.status(200).json(notice);
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    res.status(500).json({ message: '공지사항 수정 중 오류가 발생했습니다.' });
  }
});

// 공지사항 삭제
router.delete("/:id", async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    await notice.destroy();
    res.status(200).json({ message: '공지사항이 삭제되었습니다.' });
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    res.status(500).json({ message: '공지사항 삭제 중 오류가 발생했습니다.' });
  }
});

// 선택 삭제 라우트 추가
router.delete("/", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 공지사항 ID가 필요합니다." });
    }
    const result = await Notice.destroy({ where: { notice_id: ids } });
    res.json({ message: `${result}개의 공지사항이 삭제되었습니다.` });
  } catch (error) {
    console.error('공지사항 선택 삭제 실패:', error);
    res.status(500).json({ message: "공지사항 선택 삭제 중 오류가 발생했습니다." });
  }
});

module.exports = router; 