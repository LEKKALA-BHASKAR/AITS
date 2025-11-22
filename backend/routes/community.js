const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { auth, roleCheck } = require('../middleware/auth');

// Community management (Admin/Teacher)
router.post('/', auth, roleCheck(['admin', 'teacher']), communityController.createCommunity);
router.get('/all', auth, roleCheck(['admin', 'teacher']), communityController.getAllCommunities);
router.put('/:communityId', auth, roleCheck(['admin', 'teacher']), communityController.updateCommunity);
router.delete('/:communityId', auth, roleCheck(['admin', 'teacher']), communityController.deleteCommunity);

// Member management
router.post('/:communityId/members', auth, roleCheck(['admin', 'teacher']), communityController.addMembers);
router.post('/:communityId/members/roll-numbers', auth, roleCheck(['admin', 'teacher']), communityController.addMembersByRollNumbers);
router.delete('/:communityId/members/:memberId', auth, roleCheck(['admin', 'teacher']), communityController.removeMember);

// User-specific communities
router.get('/my-communities', auth, communityController.getMyCommunities);
router.get('/:communityId', auth, communityController.getCommunityById);

// Posts
router.post('/:communityId/posts', auth, communityController.createPost);
router.get('/:communityId/posts', auth, communityController.getPosts);
router.post('/:communityId/posts/:postId/like', auth, communityController.likePost);
router.post('/:communityId/posts/:postId/comments', auth, communityController.commentOnPost);

module.exports = router;
