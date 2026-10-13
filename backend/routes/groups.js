const express=require('express');
const Group = require('../models/group');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router=express.Router();

//create a group
router.post('/',auth,async function(req,res){
try{
    const name=req.body.name;
    if(!name){
        return res.status(400).json({message:'Group name is required'});
    }

    const group=await Group.create({
        name:name,
        createdBy:req.userId,
        members:[req.userId],

    });
    res.status(201).json(group);
}

catch(error){
    res.status(500).json({ message: error.message });
}
});

//list my groups
router.get('/',auth,async function(req,res){
    try{
        const groups=await Group.find({members:req.userId});
        res.json(groups);
    }catch(error){
        res.status(500).json({ message: error.message });

    }
});

// GET /api/groups/:id  -> one group with member names
router.get('/:id', auth, async function (req, res) {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // only members may view the group
    let isMember = false;
    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i]._id.toString() === req.userId) {
        isMember = true;
      }
    }
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/groups/:id/members  -> add a member by email
router.post('/:id/members', auth, async function (req, res) {
  try {
    const email = req.body.email;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // the person adding must already be a member
    const memberIds = [];
    for (let i = 0; i < group.members.length; i++) {
      memberIds.push(group.members[i].toString());
    }
    if (!memberIds.includes(req.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // find the user to add
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No user with that email. Ask them to sign up first.' });
    }

    if (memberIds.includes(user._id.toString())) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(user._id);
    await group.save();

    res.json({ message: 'Member added', group: group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


