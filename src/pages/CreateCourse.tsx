import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, ChevronLeft, ChevronRight, Plus, Trash2, Lock, Unlock, Loader, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createCourse, Course, CourseSection } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const categories = [
  'Animation', 'Creative Writing', 'Film & Video', 'Fine Art', 'Graphic Design',
  'Illustration', 'UI/UX', 'Music', 'Photography', 'Web Development', 'Other'
];

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState<Omit<Course, 'id' | 'createdAt'>>({
    instructorId: user?.uid || '',
    instructorName: user?.displayName || '',
    title: '',
    description: '',
    price: 0,
    duration: '',
    level: 'Beginner',
    category: [],
    image: '',
    sections: [],
    enrollments: 0,
    earnings: 0,
  });
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setCourseData(prev => {
      const updatedCategories = prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category];
      return { ...prev, category: updatedCategories };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { title: '', content: '', isLocked: false }]);
  };

  const handleSectionChange = (index: number, field: keyof CourseSection, value: string | boolean) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      const newCourse: Omit<Course, 'id' | 'createdAt'> = {
        ...courseData,
        sections: sections,
      };

      await createCourse(newCourse);
      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Course Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-1 font-medium">Course Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="description" className="block mb-1 font-medium">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                ></textarea>
              </div>
              <div>
                <label className="block mb-1 font-medium">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        courseData.category.includes(category)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Course Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block mb-1 font-medium">Price (₮)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block mb-1 font-medium">Duration (e.g., "10 hours")</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={courseData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="level" className="block mb-1 font-medium">Level</label>
                <select
                  id="level"
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Course Image</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Upload Image</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    <Upload size={20} className="inline mr-2" />
                    Choose Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              {courseData.image && (
                <div>
                  <img src={courseData.image} alt="Course preview" className="max-w-xs rounded-md" />
                </div>
              )}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Course Sections</h2>
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Content</label>
                    <ReactQuill
                      value={section.content}
                      onChange={(content) => handleSectionChange(index, 'content', content)}
                      className="bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={section.isLocked}
                        onChange={(e) => handleSectionChange(index, 'isLocked', e.target.checked)}
                        className="mr-2"
                      />
                      Locked Section
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSection}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
              >
                <Plus size={20} className="inline mr-2" />
                Add Section
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/instructor/dashboard" className="flex items-center text-blue-600 mb-4">
        <ArrowLeft className="mr-2" size={20} />
        Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-1/4 text-center ${
                currentStep === step ? 'text-blue-600 font-bold' : 'text-gray-400'
              }`}
            >
              Step {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 mt-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {renderStep()}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
            >
              <ChevronLeft size={20} className="inline mr-2" />
              Previous
            </button>
          )}
          {currentStep < 4 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Next
              <ChevronRight size={20} className="inline ml-2" />
            </button>
          )}
          {currentStep === 4 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 flex items-center ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;