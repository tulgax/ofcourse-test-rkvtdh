import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addComment, getComments, addReply, Comment } from '../services/commentService';
import { User, Send, Reply } from 'lucide-react';

interface CommentSectionProps {
  courseId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ courseId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      const fetchedComments = await getComments(courseId);
      setComments(fetchedComments);
    };
    fetchComments();
  }, [courseId]);

  const handleSubmitComment = async (e: React.FormEvent, content: string, parentId?: string) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    const commentData: Omit<Comment, 'id' | 'createdAt'> = {
      courseId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhotoURL: user.photoURL || '',
      content: content.trim(),
    };

    if (parentId) {
      const newReply = await addReply(parentId, commentData);
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );
    } else {
      const addedComment = await addComment(commentData);
      setComments([addedComment, ...comments]);
      setNewComment('');
    }

    setReplyingTo(null);
  };

  const CommentForm = ({ parentId }: { parentId?: string }) => {
    const [content, setContent] = useState('');

    return (
      <form onSubmit={(e) => {
        handleSubmitComment(e, content, parentId);
        setContent('');
      }} className="mb-6">
        <div className="flex items-start space-x-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
          )}
          <div className="flex-grow">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={parentId ? "Write a reply..." : "Add a comment..."}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
              disabled={!content.trim()}
            >
              <Send size={16} className="mr-2" />
              {parentId ? 'Post Reply' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>
    );
  };

  const RenderComment = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={`flex space-x-4 ${isReply ? 'ml-12 mt-4' : ''}`}>
      {comment.userPhotoURL ? (
        <img src={comment.userPhotoURL} alt={comment.userName} className="w-10 h-10 rounded-full" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={20} className="text-gray-500" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{comment.userName}</span>
          <span className="text-gray-500 text-sm">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-1 text-gray-700">{comment.content}</p>
        {!isReply && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
          >
            <Reply size={16} className="mr-1" />
            Reply
          </button>
        )}
        {replyingTo === comment.id && <CommentForm parentId={comment.id} />}
        {comment.replies && comment.replies.map(reply => (
          <RenderComment key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      {user ? (
        <CommentForm />
      ) : (
        <p className="mb-4 text-gray-600">Please log in to leave a comment.</p>
      )}
      <div className="space-y-6">
        {comments.map((comment) => (
          <RenderComment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;