import 'dotenv/config';
import { generateGrammarQuestion, explainStudentError } from '../lib/ai/generator';
import { CefrLevel } from '../types';

async function testAI() {
  console.log('Testing Gemini API with topic: Present Perfect vs Past Simple (B1)...');
  try {
    const question = await generateGrammarQuestion({
      topicTitle: 'Present Perfect vs Past Simple',
      topicRules: 'Distinguish between actions at an unstated past time (Present Perfect) vs specific finished past time (Past Simple).',
      level: 'B1',
    });

    console.log('\n--- Generated Question ---');
    console.log('Question:', question.question);
    console.log('Options:', question.options);
    console.log('Correct Answer:', question.correctAnswer);
    console.log('Explanation (RU):', question.explanationRu);
    console.log('Vocab Level:', question.cefrVocabularyLevel);

    console.log('\nTesting Smart Retry Error Explanation...');
    const explanation = await explainStudentError({
      topicTitle: 'Present Perfect vs Past Simple',
      sentence: question.question,
      correctAnswer: question.correctAnswer,
      studentAnswer: question.options.find(o => o !== question.correctAnswer) || 'wrong answer',
      level: 'B1',
    });

    console.log('Explanation (RU):', explanation.explanationRu);
    console.log('Tip (RU):', explanation.tipRu);
    console.log('\nSUCCESS! Gemini API and structured outputs are fully working!');
  } catch (err) {
    console.error('Error during AI test:', err);
  }
}

testAI();

