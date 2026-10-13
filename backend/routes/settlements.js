const express = require('express');
require('../models/user');
const Group = require('../models/group');
const Settlement = require('../models/settlement');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/settlements/:groupId   body: { from, to, amount }  (amount in rupees)
router.post('/:groupId', auth, async function (req, res) {
  try {
    const from = req.body.from;
    const to = req.body.to;
    const amount = req.body.amount;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: 'from, to and amount are required' });
    }
    if (from === to) {
      return res.status(400).json({ message: 'from and to must be different' });
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
    if (!memberIds.includes(from) || !memberIds.includes(to)) {
      return res.status(400).json({ message: 'from and to must be group members' });
    }

    const paise = Math.round(Number(amount) * 100);
    if (!(paise > 0)) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const settlement = await Settlement.create({
      group: group._id,
      from: from,
      to: to,
      amount: paise,
    });

    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/settlements/:groupId  -> list a group's payment history
router.get('/:groupId', auth, async function (req, res) {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // only members may see the history
    let isMember = false;
    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i].toString() === req.userId) {
        isMember = true;
      }
    }
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const settlements = await Settlement.find({ group: group._id })
      .populate('from', 'name')
      .populate('to', 'name')
      .sort({ date: -1 }); // newest first

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;