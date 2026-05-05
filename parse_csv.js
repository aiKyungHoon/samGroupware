const fs = require('fs');
const csv = fs.readFileSync('data.csv', 'utf8');
const rows = csv.split('\n').map(line => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i+1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
});
const members = rows.filter(r => r.length >= 5 && r[4] && r[4] !== '이름').map((r, idx) => ({
  id: String(idx + 1),
  name: r[4],
  team: r[1] ? r[1] + '팀' : '소속없음',
  cell: r[2] || '-'
}));

console.log(JSON.stringify(members.slice(0, 5), null, 2));
