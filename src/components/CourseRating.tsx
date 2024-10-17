import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addRating, getUserRating } from '../services/courseService';

interface CourseRatingProps {
  courseId: string;
  averageRating?: number;
  isEnrolled: boolean;
  onRatingChange: () => void;
}

const CourseRating: React.FC<CourseRatingProps> = ({ courseId, averageRating, isEnrolled, onRatingChange }) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRating = async () => {
      if (user && isEnrolled) {
        const rating = await getUserRating(courseId, user.uid);
        setUserRating(rating);
      }
    };
    fetchUserRating();
  }, [courseId, user, isEnrolled]);

  const handleRating = async (rating: number) => {
    if (user && isEnrolled) {
      await addRating(courseId, rating);
      setUserRating(rating);
      onRatingChange();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={`cursor-pointer ${
              (hoveredRating || userRating || 0) >= star
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
            onClick={() => isEnrolled && handleRating(star)}
            onMouseEnter={() => isEnrolled && setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
          />
        ))}
      </div>
      <span className="text-lg font-semibold">
        {averageRating ? averageRating.toFixed(1) : 'N/A'}
      </span>
      {!isEnrolled && (
        <span className="text-sm text-gray-500">(Enroll to rate)</span>
      )}
    </div>
  );
};

export default CourseRating;