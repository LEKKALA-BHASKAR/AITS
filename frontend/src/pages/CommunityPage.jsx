import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, Send, Heart, MessageCircle, Image as ImageIcon, 
  FileText, Video, MoreVertical, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CommunityPage({ user }) {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchMyCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      fetchPosts(selectedCommunity._id);
    }
  }, [selectedCommunity]);

  const fetchMyCommunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/community/my-communities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunities(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedCommunity(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (communityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/community/${communityId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/community/${selectedCommunity._id}/posts`,
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost('');
      fetchPosts(selectedCommunity._id);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/community/${selectedCommunity._id}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts(selectedCommunity._id);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/community/${selectedCommunity._id}/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts(selectedCommunity._id);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'UN';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading communities...</div>;
  }

  if (communities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No communities yet</p>
          <p className="text-gray-500 text-sm mt-2">
            You haven't joined any communities. Contact your administrator to get added.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-600" />
          Communities
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Communities List */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Communities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {communities.map((community) => (
                  <div
                    key={community._id}
                    onClick={() => setSelectedCommunity(community)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      selectedCommunity?._id === community._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {getInitials(community.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{community.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {community.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed */}
        <div className="col-span-12 md:col-span-9">
          {selectedCommunity && (
            <div className="space-y-4">
              {/* Community Header */}
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedCommunity.name}</CardTitle>
                      <p className="text-blue-100 mt-2">{selectedCommunity.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{selectedCommunity.members?.length || 0} Members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{selectedCommunity.posts?.length || 0} Posts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Create Post */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={user?.imageURL} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share something with the community..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <Button 
                          onClick={handleCreatePost} 
                          disabled={posting || !newPost.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {posting ? 'Posting...' : 'Post'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <Card key={post._id}>
                        <CardContent className="pt-6">
                          {/* Post Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <Avatar>
                              <AvatarImage src={post.author?.imageURL} />
                              <AvatarFallback>{getInitials(post.author?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">{post.author?.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(post.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                          {/* Post Actions */}
                          <Separator className="mb-3" />
                          <div className="flex items-center gap-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post._id)}
                              className={post.likes?.some(like => like.userId === user?._id) ? 'text-red-500' : ''}
                            >
                              <Heart className={`w-4 h-4 mr-1 ${post.likes?.some(like => like.userId === user?._id) ? 'fill-current' : ''}`} />
                              {post.likes?.length || 0}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.comments?.length || 0}
                            </Button>
                          </div>

                          {/* Comments */}
                          {post.comments && post.comments.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <Separator />
                              {post.comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(comment.author?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                    <p className="font-semibold text-sm">{comment.author?.name}</p>
                                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(comment.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No posts yet</p>
                        <p className="text-gray-500 text-sm mt-2">Be the first to share something!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
