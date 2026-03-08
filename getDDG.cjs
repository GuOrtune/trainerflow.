const https = require('https');
const fs = require('fs');

const exercises = [
  "Supino Reto com Barra", "Supino Inclinado com Halteres", "Supino Declinado com Barra", 
  "Crossover Polia Alta", "Crossover Polia Baixa", "Voador (Peck Deck)", "Crucifixo Reto com Halteres", "Crucifixo Inclinado com Halteres",
  "Puxada Frontal (Pulley)", "Remada Curvada com Barra", "Remada Baixa no Triângulo", "Remada Unilateral (Serrote)", 
  "Barra Fixa (Pull-up)", "Pulldown com Corda", "Remada Cavalinho",
  "Agachamento Livre", "Leg Press 45º", "Cadeira Extensora", "Cadeira Flexora", "Mesa Flexora", 
  "Afundo com Halteres", "Passada (Walking Lunge)", "Hack Machine", "Agachamento Búlgaro", "Stiff com Barra", "Levantamento Terra",
  "Elevação Pélvica (Hip Thrust)", "Glúteo na Polia Baixa", "Cadeira Abdutora", "Cadeira Adutora",
  "Desenvolvimento com Halteres", "Elevação Lateral com Halteres", "Elevação Frontal com Anilhas", 
  "Crucifixo Invertido na Máquina", "Desenvolvimento Máquina", "Remada Alta na Polia", "Encolhimento com Halteres",
  "Rosca Direta com Barra", "Rosca Alternada com Halteres", "Rosca Scott na Máquina", "Rosca Martelo com Halteres", "Rosca Concentrada",
  "Tríceps Pulley (Corda)", "Tríceps Testa com Barra W", "Tríceps Francês Unilateral", "Tríceps Coice na Polia", "Mergulho nas Paralelas",
  "Abdominal Supra no Solo", "Abdominal Infra (Elevação de Pernas)", "Prancha Isométrica", 
  "Panturrilha em Pé na Máquina", "Panturrilha Sentado (Gêmeos)"
];

async function searchDDG(query) {
  return new Promise((resolve) => {
    const q = encodeURIComponent('site:youtube.com "Gym Visual" ' + query);
    const options = {
      hostname: 'html.duckduckgo.com',
      path: '/html/?q=' + q,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/v=([a-zA-Z0-9_-]{11})/g)];
        if(matches.length > 0) resolve(matches[0][1]);
        else resolve('fallback');
      });
    }).on('error', () => resolve('fallback'));
  });
}

async function run() {
  const results = {};
  for(let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    let id = await searchDDG(ex);
    
    if (id === 'fallback') {
       // fallback mapped per group
       id = 'IODxDxX7oi4';
    }
    
    results[ex] = id;
    console.log(`[${i+1}/${exercises.length}] ${ex} -> ${id}`);
    await new Promise(r => setTimeout(r, 400)); // sleep 400ms to avoid DDG limits
  }
  
  fs.writeFileSync('videoIds.json', JSON.stringify(results, null, 2));
}

run();
