// Test script to verify the delete functionality
// This script tests both the regular delete and cascade delete options

const BASE_URL = 'http://localhost:3000/api';

// Test data - replace with actual IDs from your database
const testStudentId = 'your-student-id-here';
const testTeacherId = 'your-teacher-id-here';

async function testDelete(endpoint, id, cascade = false) {
  const url = `${BASE_URL}/${endpoint}/${id}${cascade ? '?cascade=true' : ''}`;
  
  console.log(`\n=== Testing DELETE ${url} ===`);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': 'Bearer your-token-here'
      }
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 400 && data.details) {
      console.log('\nRelated Records Found:');
      Object.entries(data.details).forEach(([key, value]) => {
        if (typeof value === 'number') {
          console.log(`  ${key}: ${value}`);
        }
      });
    }
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Delete Functionality');
  console.log('================================');
  
  // Test 1: Try to delete a student without cascade (should fail if related records exist)
  console.log('\n📝 Test 1: Delete Student without Cascade');
  const studentResult1 = await testDelete('students', testStudentId, false);
  
  // Test 2: Try to delete the same student with cascade (should succeed)
  if (!studentResult1.success && studentResult1.status === 400) {
    console.log('\n📝 Test 2: Delete Student with Cascade');
    await testDelete('students', testStudentId, true);
  }
  
  // Test 3: Try to delete a teacher without cascade (should fail if related records exist)
  console.log('\n📝 Test 3: Delete Teacher without Cascade');
  const teacherResult1 = await testDelete('teachers', testTeacherId, false);
  
  // Test 4: Try to delete the same teacher with cascade (should succeed)
  if (!teacherResult1.success && teacherResult1.status === 400) {
    console.log('\n📝 Test 4: Delete Teacher with Cascade');
    await testDelete('teachers', testTeacherId, true);
  }
  
  console.log('\n✅ Tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Check the server logs for detailed error information');
  console.log('- If deletions fail with 400 status, it means related records exist');
  console.log('- Use cascade=true to delete all related records');
  console.log('- Make sure to replace test IDs with actual IDs from your database');
}

// Instructions for running the test
console.log('🚀 Delete Functionality Test Script');
console.log('===================================');
console.log('\n⚠️  IMPORTANT: Before running this script:');
console.log('1. Make sure your Next.js development server is running (npm run dev)');
console.log('2. Replace testStudentId and testTeacherId with actual IDs from your database');
console.log('3. Add authentication headers if your API requires them');
console.log('\nTo run the test, uncomment the line below and execute: node test-delete-functionality.js');
// runTests();

module.exports = { testDelete, runTests };