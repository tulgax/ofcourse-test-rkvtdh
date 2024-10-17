import { ref, push, get, query, orderByChild, equalTo, set, update } from 'firebase/database';
import { database } from '../firebase';

export interface Comment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  content: string;
  createdAt: number;
  parentId?: string;
  replies?: Comment[];
}

export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  const commentsRef = ref(database, 'comments');
  const newCommentRef = push(commentsRef);
  const newComment = {
    ...comment,
    id: newCommentRef.key as string,
    createdAt: Date.now(),
  };
  await set(newCommentRef, newComment);
  return newComment;
};

export const addReply = async (parentCommentId: string, reply: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  const replyRef = ref(database, `comments/${parentCommentId}/replies`);
  const newReplyRef = push(replyRef);
  const newReply = {
    ...reply,
    id: newReplyRef.key as string,
    createdAt: Date.now(),
    parentId: parentCommentId,
  };
  await set(newReplyRef, newReply);
  return newReply;
};

export const getComments = async (courseId: string): Promise<Comment[]> => {
  const commentsRef = ref(database, 'comments');
  const courseCommentsQuery = query(commentsRef, orderByChild('courseId'), equalTo(courseId));
  const snapshot = await get(courseCommentsQuery);
  
  if (snapshot.exists()) {
    const commentsData = snapshot.val();
    const comments = Object.values(commentsData) as Comment[];
    return comments
      .filter(comment => !comment.parentId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(comment => ({
        ...comment,
        replies: comment.replies ? Object.values(comment.replies).sort((a, b) => a.createdAt - b.createdAt) : [],
      }));
  }
  
  return [];
};