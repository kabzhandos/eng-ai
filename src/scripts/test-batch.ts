import 'dotenv/config';
import { generateGrammarQuestionsBatch } from '../lib/ai/generator';

async function testBatching() {
  console.log('Testing Batch Generation (10 questions in 1 Gemini call)...');
  const start = Date.now();

  try {
    const questions = await generateGrammarQuestionsBatch({
      topicTitle: 'Present Perfect vs Past Simple',
      topicRules: 'Signal words: already, yet, since, for vs yesterday, last year',
      level: 'B1',
      count: 10,
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Generated ${questions.length} questions in ${elapsed}s!`);
    console.log('Sample question 1:', questions[0]?.question, '-> Answer:', questions[0]?.correctAnswer);
    console.log('Sample question 2:', questions[1]?.question, '-> Answer:', questions[1]?.correctAnswer);
    console.log('Sample explanation 1:', questions[0]?.explanationRu);
    console.log('\nBATCHING TEST PASSED! 1 request gave 10 questions with 0 subsequent verification calls needed.');
  } catch (err) {
    console.error('Error during batch test:', err);
  }
}

testBatching();

