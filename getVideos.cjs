const https = require('https');

const searches = [
  { group: 'Peito', q: 'Pectoralis Major 3D animation exercise Muscle and Motion' },
  { group: 'Costas', q: 'Latissimus Dorsi 3D animation exercise Muscle and Motion' },
  { group: 'Pernas', q: 'Quadriceps 3D animation squat exercise Muscle and Motion' },
  { group: 'Glúteos', q: 'Glutes 3D animation exercise Muscle and Motion' },
  { group: 'Ombros', q: 'Deltoid 3D animation shoulder exercise Muscle and Motion' },
  { group: 'Bíceps', q: 'Biceps brachii 3D animation exercise Muscle and Motion' },
  { group: 'Tríceps', q: 'Triceps 3D animation exercise Muscle and Motion' },
  { group: 'Abdômen', q: 'Abdominal 3D animation core exercise Muscle and Motion' },
  { group: 'Panturrilhas', q: 'Calf 3D animation exercise Muscle and Motion' },
  { group: 'Trapézio', q: 'Trapezius 3D animation exercise Muscle and Motion' }
];

async function search(q) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find video ID in the raw HTML
        const matches = [...data.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g)];
        if(matches.length > 0) {
          // avoid ad videos, pick first real match
          resolve(matches[0][1]);
        } else {
          resolve('IODxDxX7oi4');
        }
      });
    });
  });
}

async function run() {
  for(const item of searches) {
    const id = await search(item.q);
    console.log(item.group + ' -> ' + id);
  }
}
run();
