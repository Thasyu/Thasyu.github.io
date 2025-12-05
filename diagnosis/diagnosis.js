// ================= 質問とスコア =================
const questions = [
  {
    text: "朝起きたとき、最初にすることは？",
    options: [
      {text:"SNSチェック", score:{creative:2,yumemiru:1}},
      {text:"朝ごはん", score:{majime:1,happy:2}},
      {text:"二度寝", score:{mypace:2,sweet:1}},
      {text:"ストレッチ", score:{jounetsu:2,kireizuki:1}}
    ]
  },
  {
    text: "休日の過ごし方は？",
    options: [
      {text:"おでかけ", score:{adventure:2,happy:1}},
      {text:"家でまったり", score:{mypace:2,sweet:1}},
      {text:"勉強や作業", score:{majime:2,kireizuki:1}},
      {text:"創作活動", score:{creative:2,yumemiru:1}}
    ]
  },
  {
    text:"友達に悩みを相談されたら？",
    options:[
      {text:"親身に聞く", score:{yasashisa:2,majime:1}},
      {text:"解決策を考える", score:{kireizuki:2,jounetsu:1}},
      {text:"一緒に笑い飛ばす", score:{happy:2,sweet:1}},
      {text:"そっと寄り添う", score:{yasashisa:2,mypace:1}}
    ]
  },
  {
    text:"新しいことを始めるときの気持ちは？",
    options:[
      {text:"ワクワク！", score:{jounetsu:2,adventure:1}},
      {text:"まず計画を立てる", score:{majime:2,kireizuki:1}},
      {text:"少し不安", score:{mypace:2,yumemiru:1}},
      {text:"とりあえずやってみる", score:{creative:2,happy:1}}
    ]
  },
  {
    text:"あなたの部屋の状態は？",
    options:[
      {text:"いつも整理整頓", score:{kireizuki:2,majime:1}},
      {text:"少し散らかってる", score:{creative:2,mypace:1}},
      {text:"カオス", score:{adventure:2,yumemiru:1}},
      {text:"可愛いものが多い", score:{sweet:2,yasashisa:1}}
    ]
  },
  {
    text:"好きなスイーツは？",
    options:[
      {text:"ショートケーキ", score:{sweet:2,happy:1}},
      {text:"チョコ系", score:{jounetsu:2,creative:1}},
      {text:"フルーツ系", score:{yasashisa:2,yumemiru:1}},
      {text:"和菓子系", score:{majime:2,kireizuki:1}}
    ]
  },
  {
    text:"チーム作業でのあなたは？",
    options:[
      {text:"まとめ役", score:{jounetsu:2,majime:1}},
      {text:"サポート役", score:{yasashisa:2,kireizuki:1}},
      {text:"マイペース", score:{mypace:2,yumemiru:1}},
      {text:"アイデア担当", score:{creative:2,adventure:1}}
    ]
  },
  {
    text:"自分を一言で表すと？",
    options:[
      {text:"優しい", score:{yasashisa:2,sweet:1}},
      {text:"元気", score:{happy:2,jounetsu:1}},
      {text:"個性的", score:{creative:2,adventure:1}},
      {text:"落ち着いてる", score:{majime:1,kireizuki:1,mypace:1}}
    ]
  },
  {
    text:"理想の休日の天気は？",
    options:[
      {text:"晴れ！外に出たい", score:{happy:2,adventure:1}},
      {text:"雨、家でのんびり", score:{mypace:2,yumemiru:1}},
      {text:"曇りで静かに", score:{kireizuki:2,majime:1}},
      {text:"雪の日の幻想感", score:{yumemiru:2,creative:1}}
    ]
  },
  {
    text:"ちゃしゅまると一緒に何をしたい？",
    options:[
      {text:"冒険", score:{adventure:2,jounetsu:1}},
      {text:"カフェでまったり", score:{mypace:2,sweet:1}},
      {text:"アート制作", score:{creative:2,yumemiru:1}},
      {text:"おしゃべり", score:{yasashisa:2,happy:1}}
    ]
  }
];

// ================= タイプ情報 =================
const types = {
  yasashisa:{name:"やさしさ",emoji:"🌸",comment:"癒し系・思いやりたっぷり",detail:"あなたは周囲に優しさを与えるちゃしゅまるです。困っている人を放っておけず、自然と助けることができるタイプ。落ち着いた雰囲気で、人を安心させる存在です。",img:"IMG1.png"},
  jounetsu:{name:"情熱",emoji:"🔥",comment:"熱い・行動派",detail:"あなたは行動力があり、情熱的なちゃしゅまるです。新しいことに挑戦するのが好きで、やる気に満ちあふれています。周囲を巻き込む力もあります。",img:"IMG1.png"},
  mypace:{name:"マイペース",emoji:"🌙",comment:"のんびり自由",detail:"あなたは自分のペースで生きるちゃしゅまるです。周りに流されず、マイペースに物事を楽しむことができます。ゆったりした時間を大切にします。",img:"IMG1.png"},
  kireizuki:{name:"きれいずき",emoji:"💎",comment:"美意識高め",detail:"あなたは整った環境を好むちゃしゅまるです。整理整頓や美しいものが好きで、細部にも気を配るタイプ。周囲からも「きれい好き」と認められます。",img:"IMG1.png"},
  sweet:{name:"スイート",emoji:"🧁",comment:"甘え上手・かわいがられ系",detail:"あなたは愛されることが得意なちゃしゅまるです。周りの人に自然と好かれ、かわいらしい魅力で和ませます。優しさと甘さのバランスが絶妙です。",img:"IMG1.png"},
  majime:{name:"まじめ",emoji:"🍀",comment:"努力家・誠実",detail:"あなたは真面目で責任感のあるちゃしゅまるです。コツコツと努力を重ねることができ、信頼される存在です。周囲の模範となることも多いです。",img:"IMG1.png"},
  creative:{name:"クリエイティブ",emoji:"🌈",comment:"発想力豊か",detail:"あなたはアイデア豊富で表現力のあるちゃしゅまるです。独自の発想で物事を楽しむことができ、周囲に驚きや感動を与えます。自由な発想が魅力です。",img:"IMG1.png"},
  adventure:{name:"アドベンチャー",emoji:"🐾",comment:"好奇心旺盛",detail:"あなたは冒険心旺盛なちゃしゅまるです。新しいことに挑戦するのが好きで、ワクワクする毎日を求めます。周囲に刺激を与える存在です。",img:"IMG1.png"},
  yumemiru:{name:"ゆめみる",emoji:"☁️",comment:"ロマンチスト",detail:"あなたは夢見がちなちゃしゅまるです。想像力豊かで、ファンタジーや物語を楽しむ心を持っています。独特の世界観で周囲を惹きつけます。",img:"IMG1.png"},
  happy:{name:"ハッピー",emoji:"🌻",comment:"明るくポジティブ",detail:"あなたは明るく元気なちゃしゅまるです。ポジティブな性格で、周囲を笑顔にする力があります。楽しいことを見つけるのが得意です。",img:"IMG1.png"},
  densetsu:{name:"伝説のちゃしゅまる",emoji:"🗡️",comment:"強運・選ばれし者",detail:"あなたは伝説のちゃしゅまるです。バランス感覚と強運を兼ね備え、何をしてもうまくいく傾向があります。周りからも憧れられる存在で、自然と人を引きつけます。",img:"IMG1.png"}
};

// ================= 初期化 =================
let currentQ = 0;
let scores = {};
for(let key in types){ scores[key]=0; }


// ================= 質問表示 =================
function showQuestion(){
  const quizDiv = document.getElementById("quiz");
  if(currentQ >= questions.length){
    showResult();
    return;
  }
  const q = questions[currentQ];
  let html = `<div class="question"><h2>${q.text}</h2><div class="options">`;
  q.options.forEach((opt, idx)=>{
    html += `<button onclick="selectOption(${idx})">${opt.text}</button>`;
  });
  html += `</div></div>`;
  quizDiv.innerHTML = html;
}

// ================= 選択肢クリック =================
function selectOption(index){
  const q = questions[currentQ];
  const opt = q.options[index];
  for(let key in opt.score){
    scores[key] += opt.score[key];
  }
  currentQ++;
  showQuestion();
}

// ================= 結果表示 =================
function showResult(){
  document.getElementById("quiz").style.display="none";
  const resultDiv = document.getElementById("result");

  // キラキラ演出をリセット
  resultDiv.classList.remove("sparkle");

  let maxScore = Math.max(...Object.values(scores));
  let sortedScores = Object.values(scores).sort((a,b)=>b-a);
  let secondScore = sortedScores[1];
  let resultTypeKey = Object.keys(scores).find(key=>scores[key]===maxScore);

  // 伝説のちゃしゅまる判定
  if(maxScore >= 6 && maxScore === secondScore){
    resultTypeKey = "densetsu";
    // キラキラ演出を追加
    resultDiv.classList.add("sparkle");
  }

  const type = types[resultTypeKey];
  document.getElementById("result-title").innerText = `${type.emoji} ${type.name}`;
  document.getElementById("result-img").src = type.img;
  document.getElementById("result-comment").innerText = type.comment;
  document.getElementById("result-detail").innerText = type.detail;

  resultDiv.style.display="block";

  // ================= Twitterカード更新 =================
  const twitterDescription = `私は${type.emoji} ${type.name}でした！ #ちゃしゅまる診断`;
  const twitterImage = window.location.origin + "/diagnosis/" + type.img;

  const descMeta = document.querySelector('meta[name="twitter:description"]');
  const imgMeta = document.querySelector('meta[name="twitter:image"]');

  if(descMeta) descMeta.setAttribute("content", twitterDescription);
  if(imgMeta) imgMeta.setAttribute("content", twitterImage);
}

// ================= ボタン処理 =================
document.getElementById("restart-btn").addEventListener("click",()=>{
  currentQ=0;
  for(let key in scores){scores[key]=0;}
  document.getElementById("quiz").style.display="block";
  document.getElementById("result").style.display="none";
  showQuestion();
});

document.getElementById("share-btn").addEventListener("click",()=>{
  const typeText = document.getElementById("result-title").innerText;
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`私は${typeText}でした！ #ちゃしゅまる診断`);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`,'_blank');
});

// ================= 初期表示 =================
showQuestion();