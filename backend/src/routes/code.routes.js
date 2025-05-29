const express = require("express");
const router = express.Router();
const { MasterCode, DetailCode } = require("../models");

// 마스터 코드 목록 조회
router.get("/master", async (req, res) => {
  try {
    const masterCodes = await MasterCode.findAll({
      where: { use_yn: 'Y' },
      order: [['master_name', 'ASC']]
    });
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.status(200).json(masterCodes);
  } catch (error) {
    console.error('마스터 코드 조회 실패:', error);
    res.status(500).json({ message: '마스터 코드 조회 중 오류가 발생했습니다.' });
  }
});

// 상세 코드 목록 조회
router.get("/detail", async (req, res) => {
  try {
    const { master_id } = req.query;
    if (!master_id) {
      return res.status(400).json({ message: "master_id is required" });
    }

    const detailCodes = await DetailCode.findAll({
      where: { 
        master_id,
        use_yn: 'Y'
      },
      order: [['sort_order', 'ASC']]
    });
    
    res.status(200).json(detailCodes);
  } catch (error) {
    console.error('상세 코드 조회 실패:', error);
    res.status(500).json({ message: '상세 코드 조회 중 오류가 발생했습니다.' });
  }
});

// 상세 코드 목록 조회 (마스터코드별)
router.get("/detail/:masterId", async (req, res) => {
  try {
    const { masterId } = req.params;
    const detailCodes = await DetailCode.findAll({
      where: {
        master_id: masterId,
        use_yn: 'Y'
      },
      order: [['sort_order', 'ASC']]
    });
    res.status(200).json(detailCodes);
  } catch (error) {
    console.error('상세 코드 조회 실패:', error);
    res.status(500).json({ message: '상세 코드 조회 중 오류가 발생했습니다.' });
  }
});

// 공통 코드 목록 조회
router.get("/", (req, res) => {
  res.status(200).json([
    {
      id: 1,
      category: "language",
      name: "Java",
      description: "Java 프로그래밍 언어",
    },
    { id: 2, category: "system", name: "Linux", description: "Linux 운영체제" },
    { id: 3, category: "company", name: "회사A", description: "협력 업체" },
  ]);
});

// 공통 코드 카테고리별 조회
router.get("/:category", (req, res) => {
  res
    .status(200)
    .json([{ id: 1, name: "Java", description: "Java 프로그래밍 언어" }]);
});

// 공통 코드 추가
router.post("/", (req, res) => {
  res.status(201).json({ message: "공통 코드 추가 성공" });
});

// 공통 코드 수정
router.put("/:id", (req, res) => {
  res.status(200).json({ message: "공통 코드 수정 성공" });
});

// 공통 코드 삭제
router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "공통 코드 삭제 성공" });
});

// 마스터 코드 추가
router.post("/master", async (req, res) => {
  try {
    const masterCode = await MasterCode.create(req.body);
    res.status(201).json(masterCode);
  } catch (error) {
    console.error('마스터 코드 생성 실패:', error);
    res.status(500).json({ message: '마스터 코드 생성 중 오류가 발생했습니다.' });
  }
});

// 마스터 코드 수정
router.put("/master/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await MasterCode.update(req.body, {
      where: { master_id: id }
    });
    if (updated) {
      const updatedCode = await MasterCode.findByPk(id);
      res.status(200).json(updatedCode);
    } else {
      res.status(404).json({ message: '마스터 코드를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('마스터 코드 수정 실패:', error);
    res.status(500).json({ message: '마스터 코드 수정 중 오류가 발생했습니다.' });
  }
});

// 마스터 코드 삭제 (실제로는 use_yn을 'N'으로 변경)
router.delete("/master/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await MasterCode.update(
      { use_yn: 'N' },
      { where: { master_id: id } }
    );
    if (updated) {
      res.status(200).json({ message: '마스터 코드가 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '마스터 코드를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('마스터 코드 삭제 실패:', error);
    res.status(500).json({ message: '마스터 코드 삭제 중 오류가 발생했습니다.' });
  }
});

// 상세 코드 추가
router.post("/detail", async (req, res) => {
  try {
    const detailCode = await DetailCode.create(req.body);
    res.status(201).json(detailCode);
  } catch (error) {
    console.error('상세 코드 생성 실패:', error);
    res.status(500).json({ message: '상세 코드 생성 중 오류가 발생했습니다.' });
  }
});

// 상세 코드 수정
router.put("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await DetailCode.update(req.body, {
      where: { detail_id: id }
    });
    if (updated) {
      const updatedCode = await DetailCode.findByPk(id);
      res.status(200).json(updatedCode);
    } else {
      res.status(404).json({ message: '상세 코드를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('상세 코드 수정 실패:', error);
    res.status(500).json({ message: '상세 코드 수정 중 오류가 발생했습니다.' });
  }
});

// 상세 코드 삭제 (실제로는 use_yn을 'N'으로 변경)
router.delete("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await DetailCode.update(
      { use_yn: 'N' },
      { where: { detail_id: id } }
    );
    if (updated) {
      res.status(200).json({ message: '상세 코드가 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '상세 코드를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('상세 코드 삭제 실패:', error);
    res.status(500).json({ message: '상세 코드 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
