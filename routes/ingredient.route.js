const router = require("express").Router();

const nonAccentVietnamese = (str) => {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
};

router.get("/", (req, res) => {
  const { search } = req.query;
  if (!search) {
    return res.status(400).json({
      message: "No search keyword",
    });
  }

  const language = req.headers["accept-language"] || "vi";

  const ingres = require(`./../utils/ingredient/ingredients_${language}.json`);
  let data = [];
  ingres.forEach((item) => {
    if (item.name === search) {
      data.unshift(item);
    } else if (item.name.includes(search)) {
      data.push(item);
    }
  });
  return res.status(200).json({
    data,
  });
});

module.exports = router;
