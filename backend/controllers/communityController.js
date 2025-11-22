const Community = require('../models/Community');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

module.exports = {
  // Create a new community
  async createCommunity(req, res) {
    try {
      const { name, description, type, department, section, members } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Community name is required' });
      }

      // Get creator info
      const userType = req.user.role === 'admin' ? 'Admin' : 'Teacher';
      const creator = req.user.role === 'admin' 
        ? await require('../models/Admin').findById(req.user.id)
        : await Teacher.findById(req.user.id);

      const community = await Community.create({
        name,
        description,
        type: type || 'private',
        createdBy: {
          userId: req.user.id,
          userType,
          name: creator.name
        },
        department,
        section,
        members: members || [],
        posts: []
      });

      // Add creator as admin member
      community.addMember(req.user.id, userType, creator.name, 'admin');
      await community.save();

      res.status(201).json({
        message: 'Community created successfully',
        community
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get all communities for a user
  async getMyCommunities(req, res) {
    try {
      const userId = req.user.id;

      const communities = await Community.find({
        'members.userId': userId,
        isActive: true
      }).sort({ updatedAt: -1 });

      res.json(communities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get all communities (admin/teacher)
  async getAllCommunities(req, res) {
    try {
      const { type, department, section } = req.query;

      const query = { isActive: true };
      if (type) query.type = type;
      if (department) query.department = department;
      if (section) query.section = section;

      const communities = await Community.find(query)
        .populate('department', 'name code')
        .populate('section', 'name')
        .sort({ updatedAt: -1 });

      res.json(communities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get community by ID
  async getCommunityById(req, res) {
    try {
      const { communityId } = req.params;

      const community = await Community.findById(communityId)
        .populate('department', 'name code')
        .populate('section', 'name');

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user is member
      if (!community.isMember(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. You are not a member of this community.' });
      }

      res.json(community);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add members to community
  async addMembers(req, res) {
    try {
      const { communityId } = req.params;
      const { members } = req.body; // Array of { userId, userType, role }

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user has admin/moderator role
      if (!community.hasRole(req.user.id, 'admin') && !community.hasRole(req.user.id, 'moderator')) {
        return res.status(403).json({ error: 'Only admins and moderators can add members' });
      }

      // Add members
      for (const member of members) {
        let user;
        if (member.userType === 'Student') {
          user = await Student.findById(member.userId);
        } else if (member.userType === 'Teacher') {
          user = await Teacher.findById(member.userId);
        }

        if (user) {
          community.addMember(member.userId, member.userType, user.name, member.role || 'member');
        }
      }

      await community.save();

      res.json({
        message: 'Members added successfully',
        community
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add members by roll numbers (student-specific)
  async addMembersByRollNumbers(req, res) {
    try {
      const { communityId } = req.params;
      const { rollNumbers } = req.body; // Array of roll numbers

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user has admin/moderator role
      if (!community.hasRole(req.user.id, 'admin') && !community.hasRole(req.user.id, 'moderator')) {
        return res.status(403).json({ error: 'Only admins and moderators can add members' });
      }

      // Find students by roll numbers
      const students = await Student.find({ 
        rollNumber: { $in: rollNumbers },
        isActive: true 
      });

      // Add students to community
      for (const student of students) {
        community.addMember(student._id, 'Student', student.name, 'member');
      }

      await community.save();

      res.json({
        message: `${students.length} students added successfully`,
        community,
        addedStudents: students.map(s => ({ name: s.name, rollNumber: s.rollNumber }))
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Remove member from community
  async removeMember(req, res) {
    try {
      const { communityId, memberId } = req.params;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user has admin role
      if (!community.hasRole(req.user.id, 'admin')) {
        return res.status(403).json({ error: 'Only admins can remove members' });
      }

      community.removeMember(memberId);
      await community.save();

      res.json({
        message: 'Member removed successfully',
        community
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create a post in community
  async createPost(req, res) {
    try {
      const { communityId } = req.params;
      const { content, attachments } = req.body;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user is member
      if (!community.isMember(req.user.id)) {
        return res.status(403).json({ error: 'You must be a member to post' });
      }

      // Get user info
      let user;
      let userType;
      if (req.user.role === 'student') {
        user = await Student.findById(req.user.id);
        userType = 'Student';
      } else if (req.user.role === 'teacher') {
        user = await Teacher.findById(req.user.id);
        userType = 'Teacher';
      } else {
        user = await require('../models/Admin').findById(req.user.id);
        userType = 'Admin';
      }

      const post = {
        author: {
          userId: req.user.id,
          userType,
          name: user.name,
          imageURL: user.imageURL
        },
        content,
        attachments: attachments || [],
        likes: [],
        comments: []
      };

      community.posts.unshift(post);
      await community.save();

      res.status(201).json({
        message: 'Post created successfully',
        post: community.posts[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get posts from community
  async getPosts(req, res) {
    try {
      const { communityId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user is member
      if (!community.isMember(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const startIndex = (page - 1) * limit;
      const posts = community.posts.slice(startIndex, startIndex + parseInt(limit));

      res.json({
        posts,
        total: community.posts.length,
        page: parseInt(page),
        totalPages: Math.ceil(community.posts.length / limit)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Like a post
  async likePost(req, res) {
    try {
      const { communityId, postId } = req.params;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const post = community.posts.id(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Toggle like
      const likeIndex = post.likes.findIndex(
        like => like.userId.toString() === req.user.id
      );

      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push({
          userId: req.user.id,
          userType: req.user.role === 'student' ? 'Student' : req.user.role === 'teacher' ? 'Teacher' : 'Admin'
        });
      }

      await community.save();

      res.json({
        message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
        likesCount: post.likes.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Comment on a post
  async commentOnPost(req, res) {
    try {
      const { communityId, postId } = req.params;
      const { content } = req.body;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const post = community.posts.id(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Get user info
      let user;
      let userType;
      if (req.user.role === 'student') {
        user = await Student.findById(req.user.id);
        userType = 'Student';
      } else if (req.user.role === 'teacher') {
        user = await Teacher.findById(req.user.id);
        userType = 'Teacher';
      } else {
        user = await require('../models/Admin').findById(req.user.id);
        userType = 'Admin';
      }

      post.comments.push({
        author: {
          userId: req.user.id,
          userType,
          name: user.name
        },
        content
      });

      await community.save();

      res.status(201).json({
        message: 'Comment added successfully',
        comment: post.comments[post.comments.length - 1]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update community
  async updateCommunity(req, res) {
    try {
      const { communityId } = req.params;
      const { name, description, settings } = req.body;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user has admin role
      if (!community.hasRole(req.user.id, 'admin')) {
        return res.status(403).json({ error: 'Only admins can update community' });
      }

      if (name) community.name = name;
      if (description) community.description = description;
      if (settings) community.settings = { ...community.settings, ...settings };

      await community.save();

      res.json({
        message: 'Community updated successfully',
        community
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete community
  async deleteCommunity(req, res) {
    try {
      const { communityId } = req.params;

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user has admin role
      if (!community.hasRole(req.user.id, 'admin') && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete community' });
      }

      community.isActive = false;
      await community.save();

      res.json({ message: 'Community deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
