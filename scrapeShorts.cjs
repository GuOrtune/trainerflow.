const https = require('https');
const fs = require('fs');

const url = 'https://www.youtube.com/@Gymworkout143/shorts';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept-Language': 'en-US,en;q=0.9'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (match) {
      try {
        const json = JSON.parse(match[1]);
        const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs;
        let shortsTab = null;
        for (let tab of tabs || []) {
           if (tab.tabRenderer?.title === 'Shorts' || tab.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/shorts')) {
              shortsTab = tab.tabRenderer;
              break;
           }
        }
        
        const items = [];
        if (shortsTab) {
           const list = shortsTab.content?.richGridRenderer?.contents || [];
           for (let item of list) {
              const reel = item.richItemRenderer?.content?.reelItemRenderer;
              if (reel) {
                 const id = reel.videoId;
                 const title = reel.headline?.simpleText || '';
                 items.push({ id, title });
              }
           }
        }
        
        fs.writeFileSync('channel_shorts.json', JSON.stringify(items, null, 2));
        console.log(`Extracted ${items.length} shorts from @Gymworkout143`);
      } catch (e) {
        console.error('Error parsing JSON', e.message);
      }
    } else {
      console.log('Could not find ytInitialData');
    }
  });
}).on('error', console.error);
