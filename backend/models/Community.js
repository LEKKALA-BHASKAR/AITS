const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  author: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'posts.author.userType' },
    userType: { type: String, enum: ['Student', 'Teacher', 'Admin'], required: true },
    name: { type: String, required: true },
    imageURL: { type: String }
  },
  content: { type: String, required: true },
  attachments: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'document', 'video'], required: true },
    name: { type: String }
  }],
  likes: [{
    userId: mongoose.Schema.Types.ObjectId,
    userType: { type: String, enum: ['Student', 'Teacher', 'Admin'] }
  }],
  comments: [{
    author: {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      userType: { type: String, enum: ['Student', 'Teacher', 'Admin'], required: true },
      name: { type: String, required: true }
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const CommunityMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'members.userType' },
  userType: { type: String, enum: ['Student', 'Teacher', 'Admin'], required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const CommunitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['public', 'private', 'department', 'section', 'class'],
    default: 'private'
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'createdBy.userType' },
    userType: { type: String, enum: ['Teacher', 'Admin'], required: true },
    name: { type: String, required: true }
  },
  members: [CommunityMemberSchema],
  posts: [CommunityPostSchema],
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  imageURL: { type: String },
  settings: {
    allowPosts: { type: Boolean, default: true },
    allowComments: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowedRoles: [{ type: String, enum: ['admin', 'moderator', 'member'] }]
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
CommunitySchema.index({ type: 1, isActive: 1 });
CommunitySchema.index({ 'members.userId': 1 });
CommunitySchema.index({ department: 1 });
CommunitySchema.index({ section: 1 });

// Pre-save hook to update timestamp
CommunitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user is member
CommunitySchema.methods.isMember = function(userId) {
  return this.members.some(m => m.userId.toString() === userId.toString());
};

// Method to check if user is admin/moderator
CommunitySchema.methods.hasRole = function(userId, role) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  return member && (member.role === role || member.role === 'admin');
};

// Method to add member
CommunitySchema.methods.addMember = function(userId, userType, name, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({ userId, userType, name, role });
  }
};

// Method to remove member
CommunitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
};

module.exports = mongoose.model('Community', CommunitySchema);
