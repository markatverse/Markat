const fs = require('fs');
const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const files = walkSync('src');
let count = 0;
const findStr = "const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';";
const replaceStr = "const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return http:// + window.location.hostname + :3001; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();";

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(findStr)) {
    fs.writeFileSync(f, content.replace(findStr, replaceStr));
    count++;
  }
});
console.log('Replaced in ' + count + ' files');
