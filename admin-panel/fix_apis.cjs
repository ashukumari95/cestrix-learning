const fs = require('fs');
const files = [
  'src/roles/coaching-admin/pages/tests/TestList.tsx',
  'src/roles/coaching-admin/pages/tests/TestBuilder.tsx',
  'src/roles/coaching-admin/pages/tests/AssignTestModal.tsx',
  'src/roles/coaching-admin/pages/results/ResultsDashboard.tsx',
  'src/roles/coaching-admin/pages/questions/BulkImportModal.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/api\.get\('\/tests/g, "api.get('/coaching/tests");
    content = content.replace(/api\.get\(`\/tests/g, "api.get(`/coaching/tests");
    content = content.replace(/api\.post\('\/tests/g, "api.post('/coaching/tests");
    content = content.replace(/api\.post\(`\/tests/g, "api.post(`/coaching/tests");
    content = content.replace(/api\.put\('\/tests/g, "api.put('/coaching/tests");
    content = content.replace(/api\.put\(`\/tests/g, "api.put(`/coaching/tests");
    content = content.replace(/api\.delete\('\/tests/g, "api.delete('/coaching/tests");
    content = content.replace(/api\.delete\(`\/tests/g, "api.delete(`/coaching/tests");
    
    // Questions endpoints
    content = content.replace(/api\.get\('\/questions/g, "api.get('/coaching/questions");
    content = content.replace(/api\.get\(`\/questions/g, "api.get(`/coaching/questions");
    content = content.replace(/api\.post\('\/questions/g, "api.post('/coaching/questions");
    content = content.replace(/api\.post\(`\/questions/g, "api.post(`/coaching/questions");

    // Batches endpoints in AssignTestModal
    content = content.replace(/api\.get\('\/academic\/batches/g, "api.get('/coaching/academic/batches");
    
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed API paths');
