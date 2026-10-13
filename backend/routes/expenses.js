const express=require("express");
const Group = require('../models/group');
const Expense = require('../models/expense');
require('../models/user'); // makes sure the User model is loaded for populate
const auth = require('../middleware/auth');

const router = express.Router();

//add an expense
router.post('/:groupId',auth,async function(req,res){
try{
    const description = req.body.description;
    const amount = req.body.amount;
    const paidBy = req.body.paidBy;
    const splitAmong = req.body.splitAmong;

     if (!description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
      return res.status(400).json({ message: 'description, amount, paidBy and splitAmong are required' });
    }

     const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberIds = [];
    for (let i = 0; i < group.members.length; i++) {
      memberIds.push(group.members[i].toString());
    }

    if (!memberIds.includes(req.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

     if (!memberIds.includes(paidBy)) {
      return res.status(400).json({ message: 'paidBy must be a group member' });
    }
    for (let i = 0; i < splitAmong.length; i++) {
      if (!memberIds.includes(splitAmong[i])) {
        return res.status(400).json({ message: 'Everyone in splitAmong must be a group member' });
      }
    }

    const total = Math.round(Number(amount) * 100);
    if (!(total > 0)) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const count = splitAmong.length;
    const baseShare = Math.floor(total / count); // whole paise each
    let leftover = total - baseShare * count;    // paise that did not divide evenly

    const splits = [];
    for (let i = 0; i < count; i++) {
      let share = baseShare;
      if (leftover > 0) {
        share = share + 1; // give one extra paisa to the first few people
        leftover = leftover - 1;
      }
      splits.push({ user: splitAmong[i], amount: share });
    }

     const expense = await Expense.create({
      group: group._id,
      description: description,
      amount: total,
      paidBy: paidBy,
      splits: splits,
     });

       res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
    });


    // GET /api/expenses/:groupId  -> list a group's expenses
router.get('/:groupId', auth, async function (req, res) {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    let isMember = false;
    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i].toString() === req.userId) {
        isMember = true;
      }
    }
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const expenses = await Expense.find({ group: group._id })
      .populate('paidBy', 'name')
      .populate('splits.user', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;








