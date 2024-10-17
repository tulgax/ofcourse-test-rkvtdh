import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Book, Award, ArrowLeft, User, Link as LinkIcon, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getCourse, Course, enrollInCourse } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import EnrollmentDialog from '../components/EnrollmentDialog';
import CourseSectionList from '../components/CourseSectionList';
import CommentSection from '../components/CommentSection';
import CourseRating from '../components/CourseRating';
import { formatCurrency } from '../utils/formatCurrency';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (id) {
          const fetchedCourse = await getCourse(id);
          setCourse(fetchedCourse);
          setIsEnrolled(fetchedCourse?.enrolledStudents?.includes(user?.uid || '') || false);
        } else {
          setError("Course ID is missing");
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    setShowEnrollmentDialog(true);
  };

  const handleEnrollmentComplete = async () => {
    if (course && user) {
      try {
        await enrollInCourse(course.id, user.uid);
        setIsEnrolled(true);
        setCourse(prevCourse => ({
          ...prevCourse!,
          enrolledStudents: [...(prevCourse?.enrolledStudents || []), user.uid]
        }));
      } catch (error) {
        console.error('Error enrolling in course:', error);
        setError('Failed to enroll in the course. Please try again.');
      }
    }
    setShowEnrollmentDialog(false);
  };

  const getCategoryString = (categories: string[] | string): string => {
    if (Array.isArray(categories)) {
      return categories.join(', ');
    }
    return categories;
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this course: ${course?.title}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(course?.title || '')}&summary=${encodeURIComponent(course?.description || '')}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
        break;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !course) {
    return <div className="text-center py-8 text-red-600">Error: {error || "Course not found"}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/courses" className="flex items-center text-blue-600 mb-4">
        <ArrowLeft className="mr-2" size={20} />
        <span className="text-sm">Back to Courses</span>
      </Link>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <img src={course.image || `https://source.unsplash.com/random/1200x400?${getCategoryString(course.category)},${course.id}`} alt={course.title} className="w-full h-48 md:h-64 object-cover" />
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <div className="flex space-x-2">
              <button onClick={() => handleShare('facebook')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Facebook size={20} className="text-blue-600" />
              </button>
              <button onClick={() => handleShare('twitter')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Twitter size={20} className="text-blue-400" />
              </button>
              <button onClick={() => handleShare('linkedin')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Linkedin size={20} className="text-blue-700" />
              </button>
              <button onClick={() => handleShare('copy')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <LinkIcon size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center mb-6">
            <div className="flex items-center mb-2 md:mb-0 md:mr-4">
              {course.instructorPhotoURL ? (
                <img 
                  src={course.instructorPhotoURL} 
                  alt={course.instructorName} 
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-semibold">Instructor</p>
                <p>{course.instructorName}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center">
                <Clock className="text-gray-400 mr-1" size={16} />
                <span className="text-sm">{course.duration} hours</span>
              </div>
              <div className="flex items-center">
                <Award className="text-gray-400 mr-1" size={16} />
                <span className="text-sm">{course.level}</span>
              </div>
              <div className="flex items-center">
                <Book className="text-gray-400 mr-1" size={16} />
                <span className="text-sm">{getCategoryString(course.category)}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-700 mb-6">{course.description}</p>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <CourseRating
              courseId={course.id}
              averageRating={course.averageRating}
              isEnrolled={isEnrolled}
              onRatingChange={() => {
                // Refresh course data to get updated rating
                getCourse(course.id).then(updatedCourse => {
                  if (updatedCourse) {
                    setCourse(updatedCourse);
                  }
                });
              }}
            />
            <div className="mt-4 md:mt-0">
              <span className="text-2xl md:text-3xl font-bold mr-4">{formatCurrency(course.price)}</span>
              {!isEnrolled ? (
                <button 
                  onClick={handleEnroll}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
                >
                  Enroll Now
                </button>
              ) : (
                <span className="text-green-600 font-semibold">Enrolled</span>
              )}
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Course Content</h2>
          <CourseSectionList courseId={course.id} sections={course.sections} isEnrolled={isEnrolled} />
        </div>
      </div>
      <CommentSection courseId={course.id} />
      {showEnrollmentDialog && (
        <EnrollmentDialog
          course={course}
          onClose={() => setShowEnrollmentDialog(false)}
          onEnroll={handleEnrollmentComplete}
        />
      )}
    </div>
  );
};

export default CourseDetails;