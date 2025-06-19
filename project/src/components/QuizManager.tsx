import React, { useState, useEffect } from 'react';
import { 
  Plus,
  HelpCircle,
  Calendar,
  Clock,
  Trash2,
  Users,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Content } from '../lib/supabase';
import { perplexityAI } from '../lib/perplexity';
import toast from 'react-hot-toast';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface QuizFormData {
  title: string;
  description: string;
  scheduled_time: string;
  questions: QuizQuestion[];
}

export function QuizManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [quizzes, setQuizzes] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [topic, setTopic] = useState('');

  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    scheduled_time: '',
    questions: [{ 
      question: '', 
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ] 
    }]
  });

  useEffect(() => {
    loadQuizzes();
    loadUserCount();
  }, []);

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'quiz')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCount = async () => {
    try {
      const { count } = await supabase
        .from('telegram_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      setUserCount(count || 0);
    } catch (error) {
      console.error('Error loading user count:', error);
    }
  };

  const handleAddQuestion = () => {
    if (formData.questions.length >= 5) {
      toast.error('Maximum 5 questions allowed per quiz');
      return;
    }

    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    });
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index].question = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex
    }));
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGeneratingQuiz(true);
    try {
      const content = await perplexityAI.generateContent('quiz', topic);
      if (!content.content_data.questions?.length) {
        throw new Error('No questions generated');
      }

      setFormData({
        title: content.title,
        description: content.description,
        scheduled_time: content.scheduled_time,
        questions: content.content_data.questions
      });

      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('content')
        .insert([{
          type: 'quiz',
          title: formData.title,
          description: formData.description,
          content_data: { questions: formData.questions },
          scheduled_time: formData.scheduled_time,
          is_active: true
        }]);

      if (error) throw error;

      toast.success('Quiz scheduled successfully!');
      setFormData({
        title: '',
        description: '',
        scheduled_time: '',
        questions: [{
          question: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }]
      });
      setShowAddForm(false);
      loadQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to schedule quiz');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Quiz deleted successfully!');
      loadQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Quiz Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Quiz</h2>

          {/* AI Generation */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Generate Quiz with AI</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., 'Python basics', 'World War II')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
              <button
                onClick={handleGenerateQuiz}
                disabled={generatingQuiz}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {generatingQuiz ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Brief description of the quiz"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your question"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={option.isCorrect}
                          onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300"
                          required
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {formData.questions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors"
                >
                  Add Another Question
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Schedule Quiz
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scheduled Quizzes</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your interactive quizzes</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quiz</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <HelpCircle className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                      <p className="text-gray-600 mt-1">{quiz.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(quiz.scheduled_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(quiz.scheduled_time).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{userCount} recipients</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HelpCircle className="w-4 h-4" />
                          <span>{quiz.content_data.questions?.length || 0} questions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {quiz.is_active ? 'Scheduled' : 'Sent'}
                    </span>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No quizzes scheduled yet</p>
              <p className="text-sm mt-1">Click "Add Quiz" to create your first interactive quiz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
