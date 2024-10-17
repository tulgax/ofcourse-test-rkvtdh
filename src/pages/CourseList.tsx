import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Search, Filter } from 'lucide-react';
import { getAllCourses, Course } from '../services/courseService';
import CourseSkeleton from '../components/CourseSkeleton';
import { formatCurrency } from '../utils/formatCurrency';

const categories = [
  'Animation', 'Creative Writing', 'Film & Video', 'Fine Art', 'Graphic Design',
  'Illustration', 'UI/UX', 'Music', 'Photography', 'Web Development', 'Other'
];

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const allCourses = await getAllCourses();
        setCourses(allCourses);
        setFilteredCourses(allCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterCourses(term, selectedCategory);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterCourses(searchTerm, category);
  };

  const filterCourses = (term: string, category: string) => {
    const filtered = courses.filter(course =>
      (course.title.toLowerCase().includes(term) || course.description.toLowerCase().includes(term)) &&
      (category === '' || (Array.isArray(course.category) ? course.category.includes(category) : course.category === category))
    );
    setFilteredCourses(filtered);
  };

  const getCourseCategories = (course: Course): string[] => {
    return Array.isArray(course.category) ? course.category : [course.category];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Available Courses</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <CourseSkeleton key={index} />
          ))
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={course.image || `https://source.unsplash.com/random/800x600?${getCourseCategories(course)[0]},${course.id}`} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-600 mb-2 text-sm">Instructor: {course.instructorName}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {getCourseCategories(course).map((cat, index) => (
                    <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="flex items-center mb-2">
                  <Star className="text-yellow-400 mr-1" size={16} />
                  <span className="text-sm">{course.averageRating ? course.averageRating.toFixed(1) : 'Not rated'}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Clock className="text-gray-400 mr-1" size={16} />
                  <span className="text-sm">{course.duration} hours</span>
                </div>
                <div className="flex items-center mb-2">
                  <Calendar className="text-gray-400 mr-1" size={16} />
                  <span className="text-sm">{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold">{formatCurrency(course.price)}</span>
                  <Link to={`/courses/${course.id}`} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition duration-300">
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseList;