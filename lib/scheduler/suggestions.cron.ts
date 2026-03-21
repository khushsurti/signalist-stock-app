// Test version - पहले यह use करो
export async function runSuggestionGenerator() {
  console.log('🔄 Generating suggestions...');
  console.log('✅ Success! This is working.');
  
  return { success: true, count: 5 };
}

// Development mode में auto-run
if (process.env.NODE_ENV === 'development') {
  console.log('⏰ Test mode - running once...');
  runSuggestionGenerator();
}