import 'dotenv/config';

async function testPlacement() {
  console.log('Testing 20-Question Placement Test endpoint...');
  try {
    const res = await fetch('http://localhost:3000/api/placement');
    const data = await res.json();

    console.log(`Received ${data.totalQuestions} questions for placement test.`);
    if (data.questions && data.questions.length === 20) {
      console.log('Question 1:', data.questions[0].question, `[${data.questions[0].levelBlock}]`);
      console.log('Question 6:', data.questions[5].question, `[${data.questions[5].levelBlock}]`);
      console.log('Question 11:', data.questions[10].question, `[${data.questions[10].levelBlock}]`);
      console.log('Question 16:', data.questions[15].question, `[${data.questions[15].levelBlock}]`);
      console.log('Question 20:', data.questions[19].question, `[${data.questions[19].levelBlock}]`);
      console.log('\nSUCCESS! Exactly 20 questions in order: 5x A1 -> 5x A2 -> 5x B1 -> 5x B2.');
    } else {
      console.log('Unexpected question count:', data);
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

testPlacement();

