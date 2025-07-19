// components/ProductFinderModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductFinderModal = ({ visible, onClose, setFilters, uniqueValues }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);

  // Comprehensive question bank
  const questionBank = [
    {
      id: 'occasion',
      question: "What's the occasion you're shopping for?",
      icon: 'calendar-outline',
      type: 'single',
      options: [
        { value: 'casual', label: '🏖️ Casual Hangout', filters: { styles: ['casual'], categories: ['t-shirts', 'jeans', 'sneakers'] } },
        { value: 'work', label: '💼 Work/Business', filters: { styles: ['formal', 'business'], categories: ['shirts', 'pants', 'blazers'] } },
        { value: 'party', label: '🎉 Party/Night Out', filters: { styles: ['party'], categories: ['dresses', 'heels', 'accessories'] } },
        { value: 'workout', label: '💪 Workout/Sports', filters: { categories: ['activewear', 'sneakers'], materials: ['polyester', 'spandex'] } },
        { value: 'formal', label: '🎩 Formal Event', filters: { styles: ['formal'], categories: ['suits', 'dresses', 'formal shoes'] } }
      ]
    },
    {
      id: 'budget',
      question: "What's your budget range?",
      icon: 'card-outline',
      type: 'single',
      options: [
        { value: 'budget', label: '💰 Under $50', filters: { priceRange: { min: 0, max: 50 } } },
        { value: 'mid', label: '💎 $50 - $150', filters: { priceRange: { min: 50, max: 150 } } },
        { value: 'premium', label: '👑 $150 - $300', filters: { priceRange: { min: 150, max: 300 } } },
        { value: 'luxury', label: '💸 $300+', filters: { priceRange: { min: 300, max: 2000 } } }
      ]
    },
    {
      id: 'style',
      question: "Which style speaks to you?",
      icon: 'brush-outline',
      type: 'multiple',
      options: [
        { value: 'minimalist', label: '🤍 Minimalist', filters: { styles: ['minimalist'] } },
        { value: 'streetwear', label: '🎨 Streetwear', filters: { styles: ['streetwear'] } },
        { value: 'vintage', label: '📻 Vintage Vibes', filters: { styles: ['vintage'], conditions: ['vintage'] } },
        { value: 'bohemian', label: '🌸 Bohemian', filters: { styles: ['bohemian'] } },
        { value: 'classic', label: '⚡ Classic', filters: { styles: ['formal', 'business'] } }
      ]
    },
    {
      id: 'season',
      question: "What season are you shopping for?",
      icon: 'sunny-outline',
      type: 'single',
      options: [
        { value: 'summer', label: '☀️ Summer Vibes', filters: { seasons: ['summer'], materials: ['cotton', 'linen'] } },
        { value: 'winter', label: '❄️ Winter Warmth', filters: { seasons: ['winter'], materials: ['wool', 'cashmere'] } },
        { value: 'spring', label: '🌸 Spring Fresh', filters: { seasons: ['spring'] } },
        { value: 'fall', label: '🍂 Fall Fashion', filters: { seasons: ['fall'] } },
        { value: 'all', label: '🌈 All Season', filters: { seasons: ['all-season'] } }
      ]
    },
    {
      id: 'gender',
      question: "Who are you shopping for?",
      icon: 'people-outline',
      type: 'single',
      options: [
        { value: 'men', label: '👨 Men', filters: { genders: ['men'] } },
        { value: 'women', label: '👩 Women', filters: { genders: ['women'] } },
        { value: 'unisex', label: '👫 Unisex', filters: { genders: ['unisex'] } },
        { value: 'kids', label: '👶 Kids', filters: { genders: ['kids'], ageGroups: ['child', 'teen'] } }
      ]
    }
  ];

  useEffect(() => {
    if (visible) {
      // Always use the same 5 questions for now (we can randomize later)
      setQuestions(questionBank.slice(0, 5));
      setCurrentQuestion(0);
      setAnswers({});
    }
  }, [visible]);

  const handleAnswer = (option) => {
    const newAnswers = { ...answers };
    const question = questions[currentQuestion];
    
    if (question.type === 'multiple') {
      if (!newAnswers[question.id]) {
        newAnswers[question.id] = [];
      }
      
      if (newAnswers[question.id].includes(option.value)) {
        newAnswers[question.id] = newAnswers[question.id].filter(v => v !== option.value);
      } else {
        newAnswers[question.id].push(option.value);
      }
    } else {
      newAnswers[question.id] = option.value;
    }
    
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      applyFilters();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const applyFilters = () => {
    const newFilters = {
      brands: [],
      priceRange: { min: 0, max: 2000 },
      sizes: [],
      conditions: [],
      categories: [],
      colors: [],
      materials: [],
      genders: [],
      ageGroups: [],
      seasons: [],
      styles: [],
      rating: 0,
      featured: false,
      inStock: false,
    };

    // Apply filters based on answers
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      if (question.type === 'multiple' && Array.isArray(answer)) {
        answer.forEach(value => {
          const option = question.options.find(opt => opt.value === value);
          if (option?.filters) {
            mergeFilters(newFilters, option.filters);
          }
        });
      } else {
        const option = question.options.find(opt => opt.value === answer);
        if (option?.filters) {
          mergeFilters(newFilters, option.filters);
        }
      }
    });

    setFilters(newFilters);
    onClose();
  };

  const mergeFilters = (target, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        target[key] = [...new Set([...target[key], ...value])];
      } else if (typeof value === 'object' && value !== null) {
        target[key] = { ...target[key], ...value };
      } else if (typeof value === 'boolean') {
        target[key] = value;
      } else {
        target[key] = value;
      }
    });
  };

  if (!visible || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQuestion];
  const hasAnswer = currentQ && answers[currentQ.id];
  const canProceed = hasAnswer && (
    currentQ.type !== 'multiple' || 
    (Array.isArray(answers[currentQ.id]) && answers[currentQ.id].length > 0)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
            <Text style={styles.titleText}>Style Finder</Text>
          </View>
          <View style={styles.questionCounter}>
            <Text style={styles.counterText}>
              {currentQuestion + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Question Content */}
        <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.questionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={currentQ.icon} size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.questionText}>{currentQ.question}</Text>
            {currentQ.type === 'multiple' && (
              <Text style={styles.multipleHint}>💡 You can select multiple options</Text>
            )}
          </View>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => {
              const isSelected = currentQ.type === 'multiple' 
                ? answers[currentQ.id]?.includes(option.value)
                : answers[currentQ.id] === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption,
                  ]}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
            onPress={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentQuestion === 0 ? "#6B7280" : "#8B5CF6"} 
            />
            <Text style={[
              styles.navButtonText,
              currentQuestion === 0 && styles.disabledButtonText
            ]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed && styles.disabledButton
            ]}
            onPress={nextQuestion}
            disabled={!canProceed}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceed && styles.disabledButtonText
            ]}>
              {currentQuestion === questions.length - 1 ? 'Find My Style' : 'Next'}
            </Text>
            <Ionicons 
              name={currentQuestion === questions.length - 1 ? "sparkles" : "chevron-forward"} 
              size={20} 
              color={!canProceed ? "#6B7280" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  questionCounter: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  multipleHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionsContainer: {
    paddingBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#D1FAE5',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: '#1A1A1A',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#6B7280',
  },
});

export default ProductFinderModal;