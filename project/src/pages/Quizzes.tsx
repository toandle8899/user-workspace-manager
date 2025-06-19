import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HelpCircle, Plus, Trash2, Calendar, Clock, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface QuizContent {
  id: string;
  title: string;
  description: string;
  content_data: {
    questions: QuizQuestion[];
  };
  scheduled_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function Quizzes() {
  const [quizzes, setQuizzes] = useState<QuizContent[]>([]);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    questions: [
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

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'quiz')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }

  const handleAddQuestion = () => {
    if (newQuiz.questions.length >= 5) {
      toast.error('Maximum 5 questions allowed per quiz');
      return;
    }

    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
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
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index].question = value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map(
      (opt, idx) => ({ ...opt, isCorrect: idx === optionIndex })
    );
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  async function handleAddQuiz(e: React.FormEvent) {
    e.preventDefault();

    // Validate that each question has a correct answer selected
    const isValid = newQuiz.questions.every(q => 
      q.options.some(o => o.isCorrect) && 
      q.question.trim() !== '' &&
      q.options.every(o => o.text.trim() !== '')
    );

    if (!isValid) {
      toast.error('Please ensure all questions have content and a correct answer selected');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content')
        .insert([
          {
            type: 'quiz',
            title: newQuiz.title,
            description: newQuiz.description,
            content_data: { questions: newQuiz.questions },
            scheduled_time: newQuiz.scheduled_time,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;

      toast.success('Quiz added successfully');
      setIsAddingQuiz(false);
      setNewQuiz({
        title: '',
        description: '',
        scheduled_time: '',
        questions: [
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
      fetchQuizzes();
    } catch (error) {
      console.error('Error adding quiz:', error);
      toast.error('Failed to add quiz');
    }
  }

  async function handleDeleteQuiz(id: string) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and schedule interactive quizzes for your students
            </p>
          </div>
          <button
            onClick={() => setIsAddingQuiz(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Quiz
          </button>
        </div>

        {isAddingQuiz && (
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Quiz</h3>
              <form onSubmit={handleAddQuiz} className="mt-5 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700">
                      Scheduled Time
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduled_time"
                      id="scheduled_time"
                      required
                      value={newQuiz.scheduled_time}
                      onChange={(e) => setNewQuiz({ ...newQuiz, scheduled_time: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {newQuiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Question {qIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
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
                              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {newQuiz.questions.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors"
                    >
                      Add Another Question
                    </button>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingQuiz(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          {quizzes.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 divide-y divide-gray-200">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <HelpCircle className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                        <p className="mt-1 text-gray-600">{quiz.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(quiz.scheduled_time).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(quiz.scheduled_time).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <HelpCircle className="h-4 w-4 mr-1" />
                            <span>{quiz.content_data.questions.length} questions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete quiz"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white shadow-sm rounded-lg border border-gray-200 p-12">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first interactive quiz.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingQuiz(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
