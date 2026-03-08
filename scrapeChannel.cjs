const https = require('https');
const fs = require('fs');

const url = 'https://www.youtube.com/@Gymworkout143/shorts';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('page.html', data);
    const match = data.match(/var ytInitialData = (\{.*?\});<\/script>/);
    let items = [];
    if (match) {
        fs.writeFileSync('ytdata.json', match[1]);
        const regex = /"videoId":"([a-zA-Z0-9_-]{11})".*?"headline":\{"simpleText":"(.*?)"\}/g;
        let m;
        while ((m = regex.exec(match[1])) !== null) {
            items.push({ id: m[1], title: m[2] });
        }
        
        // Sometimes the structure is different, let's try another regex if empty
        if (items.length === 0) {
            const regex2 = /"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]/g;
            while ((m = regex2.exec(match[1])) !== null) {
                items.push({ id: m[1], title: m[2] });
            }
        }
    }
    
    // Deduplicate
    const unique = [];
    const seen = new Set();
    for (let item of items) {
       if (!seen.has(item.id)) {
           seen.add(item.id);
           unique.push(item);
       }
    }
    
    fs.writeFileSync('channel_shorts.json', JSON.stringify(unique, null, 2));
    console.log(`Extracted ${unique.length} unique shorts from @Gymworkout143`);
  });
}).on('error', console.error);
