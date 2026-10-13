const express = require('express');
const Group = require('../models/group');
const Expense = require('../models/expense');
const Settlement = require('../models/settlement');
const auth = require('../middleware/auth');
const simplifyDebts = require('../utils/simplifyDebts');

const router = express.Router();

// GET /api/balances/:groupId
router.get('/:groupId', auth, async function (req, res) {
  try {
    // 1. find the group with member names
    const group = await Group.findById(req.params.groupId).populate('members', 'name');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 2. only members can see balances
    let isMember = false;
    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i]._id.toString() === req.userId) {
        isMember = true;
      }
    }
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // 3. everyone starts at 0
    const balances = {}; // userId -> paise
    const names = {};    // userId -> name
    for (let i = 0; i < group.members.length; i++) {
      const id = group.members[i]._id.toString();
      balances[id] = 0;
      names[id] = group.members[i].name;
    }

    // 4. add up every expense
    const expenses = await Expense.find({ group: group._id });
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];

      // the payer is owed the full amount
      const payerId = expense.paidBy.toString();
      balances[payerId] = balances[payerId] + expense.amount;

      // everyone in the split owes their share
      for (let j = 0; j < expense.splits.length; j++) {
        const personId = expense.splits[j].user.toString();
        balances[personId] = balances[personId] - expense.splits[j].amount;
      }
    }

    // 5. apply settlements (money already paid back)
    const settlements = await Settlement.find({ group: group._id });
    for (let i = 0; i < settlements.length; i++) {
      const fromId = settlements[i].from.toString();
      const toId = settlements[i].to.toString();

      balances[fromId] = balances[fromId] + settlements[i].amount; // owes less now
      balances[toId] = balances[toId] - settlements[i].amount;     // is owed less now
    }

    // 6. suggested payments
    const simple = simplifyDebts(balances);
    const payments = [];
    for (let i = 0; i < simple.length; i++) {
      payments.push({
        from: { id: simple[i].from, name: names[simple[i].from] },
        to: { id: simple[i].to, name: names[simple[i].to] },
        amount: simple[i].amount,
      });
    }

    // 7. balances as a list for the frontend
    const balanceList = [];
    const ids = Object.keys(balances);
    for (let i = 0; i < ids.length; i++) {
      balanceList.push({ id: ids[i], name: names[ids[i]], amount: balances[ids[i]] });
    }

    res.json({ balances: balanceList, payments: payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;