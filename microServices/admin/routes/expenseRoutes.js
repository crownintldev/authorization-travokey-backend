const express = require("express");
const {
  addExpense,
  editExpense,
  deleteExpense,
  getExpense,
} = require("../controllers/expenseController");
const router = express.Router();

router.post("/dump", (req, res) => {
  res.send({ message: "success" });
});
router.post("/addExpense", addExpense);
router.post("/editExpense", editExpense);
router.post("/deleteExpense", deleteExpense);
router.get("/getExpense/:query", getExpense);
module.exports = router;
