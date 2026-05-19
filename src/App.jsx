import { useState, useEffect, useRef } from "react";

// ── 計算ユーティリティ ──────────────────────────
function calcHitProb(spins, rate) {
  return 1 - Math.pow(1 - 1 / rate, spins);
}
function spinsNeededForProb(prob, rate) {
  return Math.ceil(Math.log(1 - prob) / Math.log(1 - 1 / rate));
}
function moneyNeeded(spins, spinsPer1000) {
  return Math.ceil((spins / spinsPer1000) * 1000);
}

const PROB_LEVELS = [
  { prob: 0.3,  label: "30%",      color: "#44aaff" },
  { prob: 0.5,  label: "50%",      color: "#44ddaa" },
  { prob: 0.63, label: "63%（等倍）", color: "#ffcc00" },
  { prob: 0.8,  label: "80%",      color: "#ff8800" },
  { prob: 0.9,  label: "90%",      color: "#ff5500" },
  { prob: 0.95, label: "95%",      color: "#ff3333" },
  { prob: 0.99, label: "99%",      color: "#ff0055" },
];

// ── 共通コンポーネント ──────────────────────────
function Header({ page, setPage }) {
  return (
    <div style={{
      background: "linear-gradient(180deg,#0f0f20 0%,#07070f 100%)",
      borderBottom: "1px solid #ffffff0a",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ cursor:"pointer" }} onClick={() => setPage("calc")}>
        <div style={{ fontFamily:"'Zen Dots',monospace", fontSize:16, letterSpacing:3, color:"#fff", textShadow:"0 0 20px #ff444488" }}>
          🎰 PACHINKO CALC
        </div>
        <div style={{ fontSize:9, color:"#ffffff33", letterSpacing:4 }}>確率シミュレーター</div>
      </div>
      <button
        onClick={() => setPage(page === "calc" ? "guide" : "calc")}
        style={{
          background: page === "guide" ? "#ff444422" : "#ffffff11",
          border: `1px solid ${page === "guide" ? "#ff444444" : "#ffffff22"}`,
          color: page === "guide" ? "#ff8888" : "#ffffff88",
          borderRadius: 10, padding: "6px 14px", fontSize: 12,
          cursor: "pointer", fontFamily:"'Noto Sans JP',sans-serif",
        }}
      >
        {page === "calc" ? "使い方ガイド →" : "← 計算ツール"}
      </button>
    </div>
  );
}

function AnimatedNumber({ value, duration = 600 }) {
  const [display, setDisplay] = useState(value);
  const start = useRef(value);
  const raf = useRef(null);
  useEffect(() => {
    const from = start.current, to = value;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(animate);
      else start.current = to;
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

function GaugeArc({ prob }) {
  const r=80, cx=110, cy=100, startAngle=-210, endAngle=30;
  const fillDeg = (endAngle - startAngle) * Math.min(prob, 1);
  const toRad = (d) => d * Math.PI / 180;
  const arcPath = (from, to) => {
    const x1=cx+r*Math.cos(toRad(from)), y1=cy+r*Math.sin(toRad(from));
    const x2=cx+r*Math.cos(toRad(to)),   y2=cy+r*Math.sin(toRad(to));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to-from>180?1:0} 1 ${x2} ${y2}`;
  };
  const needleAngle = startAngle + fillDeg;
  const nx=cx+(r-12)*Math.cos(toRad(needleAngle)), ny=cy+(r-12)*Math.sin(toRad(needleAngle));
  const pct = Math.round(prob*100);
  const color = pct>=90?"#ff2244":pct>=70?"#ff6600":pct>=50?"#ffcc00":pct>=30?"#44ddaa":"#44aaff";
  return (
    <svg width="220" height="130" style={{ overflow:"visible" }}>
      <path d={arcPath(startAngle,endAngle)} fill="none" stroke="#ffffff0f" strokeWidth={14} strokeLinecap="round"/>
      <path d={arcPath(startAngle,startAngle+fillDeg)} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 6px ${color})`, transition:"all 0.6s cubic-bezier(.4,0,.2,1)" }}/>
      <circle cx={nx} cy={ny} r={6} fill={color}
        style={{ filter:`drop-shadow(0 0 8px ${color})`, transition:"all 0.6s cubic-bezier(.4,0,.2,1)" }}/>
      <text x={cx} y={cy+8} textAnchor="middle" fill={color} fontSize={32}
        fontFamily="'Zen Dots',monospace" fontWeight="bold" style={{ filter:`drop-shadow(0 0 8px ${color})` }}>
        {pct}%
      </text>
      <text x={cx} y={cy+26} textAnchor="middle" fill="#ffffff44" fontSize={10} fontFamily="'Noto Sans JP',sans-serif">
        当選確率
      </text>
    </svg>
  );
}

function SmallGauge({ prob, label, color }) {
  const r=44, cx=60, cy=56, startAngle=-210, endAngle=30;
  const fillDeg = (endAngle - startAngle) * Math.min(prob, 1);
  const toRad = (d) => d * Math.PI / 180;
  const arcPath = (from, to) => {
    const x1=cx+r*Math.cos(toRad(from)), y1=cy+r*Math.sin(toRad(from));
    const x2=cx+r*Math.cos(toRad(to)),   y2=cy+r*Math.sin(toRad(to));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to-from>180?1:0} 1 ${x2} ${y2}`;
  };
  const pct = Math.round(prob*100);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
      <svg width="120" height="74" style={{ overflow:"visible" }}>
        <path d={arcPath(startAngle,endAngle)} fill="none" stroke="#ffffff0f" strokeWidth={8} strokeLinecap="round"/>
        <path d={arcPath(startAngle,startAngle+fillDeg)} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 4px ${color})`, transition:"all 0.6s cubic-bezier(.4,0,.2,1)" }}/>
        <text x={cx} y={cy+4} textAnchor="middle" fill={color} fontSize={20}
          fontFamily="'Zen Dots',monospace" fontWeight="bold">
          {pct}%
        </text>
      </svg>
      <div style={{ fontSize:11, color:"#ffffff44", marginTop:-2, textAlign:"center" }}>{label}</div>
    </div>
  );
}

function StepBtn({ label, onClick, color }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={()=>setPressed(true)} onPointerUp={()=>setPressed(false)} onPointerLeave={()=>setPressed(false)}
      onClick={onClick}
      style={{
        width:36, height:36, borderRadius:10, border:`1px solid ${color}44`,
        background: pressed ? color+"33" : color+"11", color, fontSize:20, fontWeight:700,
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, transition:"background 0.1s", lineHeight:1, userSelect:"none",
      }}
    >{label}</button>
  );
}

function Slider({ label, value, min, max, step=1, onChange, unit, color="#ff4444", showStepper=false }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, color:"#ffffff77" }}>{label}</span>
        <span style={{ fontFamily:"'Zen Dots',monospace", fontSize:16, color }}>
          {value.toLocaleString()}<span style={{ fontSize:11, color:"#ffffff55", marginLeft:2 }}>{unit}</span>
        </span>
      </div>
      {showStepper && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <StepBtn label="－" color={color} onClick={()=>onChange(Math.max(min,value-step))}/>
          <div style={{ flex:1, textAlign:"center" }}>
            <span style={{ fontFamily:"'Zen Dots',monospace", fontSize:22, color, textShadow:`0 0 10px ${color}88` }}>
              {value.toLocaleString()}
            </span>
            <span style={{ fontSize:11, color:"#ffffff44", marginLeft:4 }}>{unit}</span>
          </div>
          <StepBtn label="＋" color={color} onClick={()=>onChange(Math.min(max,value+step))}/>
        </div>
      )}
      <div style={{ position:"relative", height:32, display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", left:0, right:0, height:6, background:"#ffffff0f", borderRadius:99 }}/>
        <div style={{
          position:"absolute", left:0, width:`${((value-min)/(max-min))*100}%`, height:6,
          background:`linear-gradient(90deg,${color}66,${color})`, borderRadius:99,
          boxShadow:`0 0 8px ${color}88`, transition:"width 0.1s",
        }}/>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e)=>onChange(Number(e.target.value))}
          style={{ position:"absolute", width:"100%", opacity:0, height:32, cursor:"pointer", margin:0 }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#ffffff22", marginTop:2 }}>
        <span>{min.toLocaleString()}</span><span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── 計算ツールページ ────────────────────────────
function CalcPage({ setPage }) {
  const [rate, setRate] = useState(399);
  const [spinsPer1000, setSpinsPer1000] = useState(20);
  const [budget, setBudget] = useState(5000);
  const [showOption, setShowOption] = useState(false);
  const [rushEntryRate, setRushEntryRate] = useState(60);

  const spins = Math.floor((budget/1000)*spinsPer1000);
  const prob = calcHitProb(spins, rate);
  const rushProb = 1 - Math.pow(1 - (rushEntryRate / 100) / rate, spins);

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"0 20px" }}>
      {/* 広告 */}
      <div style={{ textAlign:"center", margin:"16px 0 0" }}>
        <a href="https://px.a8.net/svt/ejp?a8mat=4B3U71+GHL8G2+2SY6+BXQOH" rel="nofollow">
          <img border="0" width="234" height="60" alt="" src="https://www21.a8.net/svt/bgt?aid=260519581997&wid=003&eno=01&mid=s00000013083002005000&mc=1"/>
        </a>
        <img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B3U71+GHL8G2+2SY6+BXQOH" alt=""/>
      </div>

      {/* Gauge */}
      <div style={{
        margin:"20px 0 0", background:"linear-gradient(135deg,#0f0f22,#12121e)",
        border:"1px solid #ffffff0f", borderRadius:20, padding:"20px 20px 12px",
        display:"flex", flexDirection:"column", alignItems:"center",
      }}>
        {!showOption ? (
          <>
            <GaugeArc prob={prob}/>
            <div style={{ display:"flex", gap:16, marginTop:4, fontSize:12, color:"#ffffff55",
              borderTop:"1px solid #ffffff0a", paddingTop:12, width:"100%", justifyContent:"center" }}>
              <span><b style={{ color:"#fff", fontFamily:"'Zen Dots',monospace" }}><AnimatedNumber value={spins}/></b> 回転</span>
              <span style={{ color:"#ffffff22" }}>·</span>
              <span>予算 <b style={{ color:"#fff", fontFamily:"'Zen Dots',monospace" }}><AnimatedNumber value={budget}/></b> 円</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display:"flex", gap:16, justifyContent:"center", width:"100%" }}>
              <SmallGauge prob={prob} label="初当たり確率" color="#44aaff"/>
              <SmallGauge prob={rushProb} label="RUSH到達確率" color="#ff4444"/>
            </div>
            <div style={{ fontSize:11, color:"#ffffff33", marginTop:8, textAlign:"center" }}>
              予算 {budget.toLocaleString()}円 / {spins.toLocaleString()}回転
            </div>
          </>
        )}
      </div>

      {/* オプション展開ボタン */}
      <button onClick={() => setShowOption(v => !v)} style={{
        width:"100%", marginTop:8, padding:"9px 0", borderRadius:12, fontSize:12,
        background: showOption ? "#ff444411" : "#ffffff0f",
        border: showOption ? "1px solid #ff444433" : "1px solid #ffffff22",
        color: showOption ? "#ff8888cc" : "#ffffff66",
        cursor:"pointer", fontFamily:"'Noto Sans JP',sans-serif",
        transition:"all 0.2s",
      }}>
        {showOption ? "▲ RUSH突入率設定を閉じる" : <span className="rainbow-btn">⚙️ RUSH突入率を設定する（上位当たり）</span>}
      </button>

      {/* オプション：RUSH突入率設定 */}
      {showOption && (
        <div style={{ background:"#0f0f22", border:"1px solid #ff444422", borderRadius:16, padding:"16px 20px", marginTop:4 }}>
          <div style={{ fontSize:11, color:"#ff8888aa", letterSpacing:1, marginBottom:14 }}>RUSH突入率設定</div>
          <Slider label="RUSH突入率（台のスペック表で確認）" value={rushEntryRate} min={1} max={100} step={1}
            onChange={setRushEntryRate} unit="%" color="#ff4444" showStepper/>
          <div style={{ fontSize:11, color:"#ffffff33", lineHeight:1.7 }}>
            ※ 当たりの中でRUSHに入る割合です。<br/>
            台のスペック表や「データロボサイトセブン」で確認できます。
          </div>
        </div>
      )}

      {/* Sliders */}
      <div style={{ margin:"10px 0", background:"#0f0f22", border:"1px solid #ffffff0f", borderRadius:20, padding:"20px" }}>
        <Slider label="大当り確率の分母" value={rate} min={99} max={799} step={1}
          onChange={setRate} unit="分の1" color="#44aaff" showStepper/>
        <Slider label="1000円あたりの回転数" value={spinsPer1000} min={10} max={200} step={1}
          onChange={setSpinsPer1000} unit="回転" color="#44ddaa" showStepper/>
        <Slider label="予算" value={budget} min={500} max={50000} step={500}
          onChange={setBudget} unit="円" color="#ff8800" showStepper/>
      </div>

      {/* 確率テーブル */}
      <div style={{ background:"#0f0f22", border:"1px solid #ffffff0f", borderRadius:20, padding:"16px 20px", marginBottom:14 }}>
        <div style={{ fontSize:11, color:"#ffffff44", letterSpacing:2, marginBottom:12 }}>
          各確率に必要な金額（1000円 {spinsPer1000}回転の場合）
        </div>
        {PROB_LEVELS.map(({ prob:p, label, color }) => {
          const s = spinsNeededForProb(p, rate);
          const m = moneyNeeded(s, spinsPer1000);
          const isCurrent = budget >= m;
          return (
            <div key={label} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 10px", borderRadius:10, marginBottom:4,
              background: isCurrent ? color+"12" : "transparent",
              border: isCurrent ? `1px solid ${color}33` : "1px solid transparent",
              transition:"all 0.3s",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}` }}/>
                <span style={{ fontSize:12, color: isCurrent ? color : "#ffffff55" }}>{label}</span>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontFamily:"'Zen Dots',monospace", fontSize:15, color: isCurrent ? color : "#ffffff44" }}>
                  {m.toLocaleString()}円
                </span>
                <span style={{ fontSize:10, color:"#ffffff33", marginLeft:6 }}>({s.toLocaleString()}回転)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* インサイト */}
      <div style={{
        background:"linear-gradient(135deg,#1a0808,#1a1008)",
        border:"1px solid #ff440022", borderRadius:16, padding:"14px 16px",
        fontSize:13, color:"#ffffff88", lineHeight:1.7,
      }}>
        {(() => {
          const pct = Math.round(prob*100);
          const moneyFor63 = moneyNeeded(spinsNeededForProb(0.63,rate), spinsPer1000);
          if (pct>=80) return <>
            <span style={{ color:"#ff4444" }}>⚡ 予算内でかなり有利です。</span><br/>
            {rate}分の1の台を{spinsPer1000}回転/1000円で回せるなら、{budget.toLocaleString()}円で当たる確率は<b style={{ color:"#ff4444" }}>{pct}%</b>あります。
          </>;
          if (pct>=50) return <>
            <span style={{ color:"#ffcc00" }}>📊 五分五分より有利です。</span><br/>
            63%（等倍）まで持っていくにはあと <b style={{ color:"#ffcc00" }}>{Math.max(0,moneyFor63-budget).toLocaleString()}円</b> 必要です。
          </>;
          return <>
            <span style={{ color:"#44aaff" }}>💡 まだ序盤です。</span><br/>
            50%を超えるには <b style={{ color:"#44aaff" }}>{Math.max(0,moneyNeeded(spinsNeededForProb(0.5,rate),spinsPer1000)-budget).toLocaleString()}円</b>、
            63%には <b style={{ color:"#ffcc00" }}>{Math.max(0,moneyFor63-budget).toLocaleString()}円</b> あと必要です。
          </>;
        })()}
      </div>

      <div style={{ marginTop:12, textAlign:"center" }}>
        <button onClick={()=>setPage("guide")} style={{
          background:"none", border:"none", color:"#ffffff55", fontSize:12,
          cursor:"pointer", textDecoration:"underline", padding:"8px 0",
        }}>使い方・確率の説明を読む</button>
      </div>

      <div style={{ marginTop:8, fontSize:10, color:"#ffffff44", textAlign:"center", lineHeight:1.8, paddingBottom:40 }}>
        ※ 確率は独立試行のため、過去の回転数は結果に影響しません。<br/>
        このツールは期待値の理解を目的としています。
      </div>
    </div>
  );
}

// ── ガイドページ ────────────────────────────────
function GuidePage({ setPage }) {
  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 20px 0" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:"0 0 8px", color:"#fff" }}>
          パチンコ確率シミュレーターとは
        </h1>
        <p style={{ color:"#ffffff88", fontSize:14, lineHeight:1.8, margin:0 }}>
          「予算〇〇円で当たる確率は？」「この台は得か損か？」をその場で計算できるツールです。感覚じゃなく数字で台を判断できるようになります。
        </p>
      </div>

      {[
        {
          tag:"基本のき", tagColor:"#44aaff",
          title:"パチンコの当たりは「毎回独立」",
          body:"1/399の台なら、1回転ごとに399分の1の抽選が行われます。前の回転の結果は次に一切影響しません。コインを投げるのと同じで、100回表が続いても次の確率はやっぱり1/2です。",
          note:{ color:"#44aaff", text:"💡 「ハマってるから当たりやすい」は数学的には正しくありません。ただし釘の良い台を選ぶことは意味があります。" },
        },
      ].map(({ tag, tagColor, title, body, note }) => (
        <Card key={title} tag={tag} tagColor={tagColor} title={title}>
          <p style={{ color:"#ffffff77", fontSize:13, lineHeight:1.8, margin:"0 0 10px" }}>{body}</p>
          {note && (
            <div style={{ background:note.color+"11", border:`1px solid ${note.color}22`, borderRadius:10, padding:"10px 14px", fontSize:13, color:note.color+"cc" }}>
              {note.text}
            </div>
          )}
        </Card>
      ))}

      <Card tag="使い方" tagColor="#44ddaa" title="3つの数字を入れるだけ">
        {[
          { label:"大当り確率の分母", desc:"台の液晶や島の看板に書いてある数字。1/319なら319、1/399なら399。", color:"#44aaff" },
          { label:"1000円あたりの回転数", desc:"釘の良し悪しを表す数字。ホール内のデータカウンターや「データロボサイトセブン」などのパチンコデータアプリで確認できます。4円パチの平均は18〜22回転、1円パチは50〜100回転が目安です。", color:"#44ddaa" },
          { label:"予算", desc:"今日使える金額を入れるだけ。500円刻みで調整できます。", color:"#ff8800" },
        ].map((item) => (
          <div key={item.label} style={{ display:"flex", gap:12, marginBottom:14 }}>
            <div style={{ width:4, borderRadius:99, background:item.color, flexShrink:0, boxShadow:`0 0 8px ${item.color}` }}/>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:item.color, marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:12, color:"#ffffff66", lineHeight:1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card tag="読み方" tagColor="#ffcc00" title="確率の表の見方">
        <p style={{ color:"#ffffff77", fontSize:13, margin:"0 0 10px" }}>
          下の表は「この金額まで使えば何%の確率で当たっているか」を示しています。
        </p>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ textAlign:"left", color:"#ffffff44", fontWeight:400, padding:"6px 8px", borderBottom:"1px solid #ffffff0f", fontSize:11 }}>確率</th>
              <th style={{ textAlign:"left", color:"#ffffff44", fontWeight:400, padding:"6px 8px", borderBottom:"1px solid #ffffff0f", fontSize:11 }}>意味</th>
            </tr>
          </thead>
          <tbody>
            {[
              { prob:"30%",   mean:"3回に1回しか当たらない序盤",       color:"#44aaff" },
              { prob:"50%",   mean:"五分五分。ここが損益分岐点の目安", color:"#44ddaa" },
              { prob:"63%",   mean:"確率通りに1回当たる金額（等倍）", color:"#ffcc00" },
              { prob:"80%",   mean:"5回に4回は当たる水準",             color:"#ff8800" },
              { prob:"95%〜", mean:"ほぼ当たるが費用が大きい",         color:"#ff4444" },
            ].map((row) => (
              <tr key={row.prob}>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:row.color, fontFamily:"'Zen Dots',monospace", fontWeight:700 }}>{row.prob}</td>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:"#ccc", fontSize:12 }}>{row.mean}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card tag="釘読み" tagColor="#ff8800" title="回転数が一番重要な理由">
        <p style={{ color:"#ffffff77", fontSize:13, margin:"0 0 10px" }}>
          同じ1/399の台でも、回転数が違うと必要な金額が大きく変わります。
        </p>
        <p style={{ color:"#ffffff55", fontSize:11, margin:"0 0 8px" }}>▼ 4円パチ</p>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, marginBottom:14 }}>
          <thead>
            <tr>
              {["1000円の回転数","50%に必要な金額","評価"].map(h=>(
                <th key={h} style={{ textAlign:"left", color:"#ffffff44", fontWeight:400, padding:"6px 8px", borderBottom:"1px solid #ffffff0f", fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { spin:"15回転", money:"約18,500円", eval:"❌ 悪い",  color:"#ff4444" },
              { spin:"18回転", money:"約15,400円", eval:"△ 普通",  color:"#ffcc00" },
              { spin:"22回転", money:"約12,600円", eval:"○ 良い",  color:"#44ddaa" },
              { spin:"25回転", money:"約11,100円", eval:"◎ 優良",  color:"#44aaff" },
            ].map((row) => (
              <tr key={row.spin}>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:"#ccc", fontFamily:"'Zen Dots',monospace", fontSize:12 }}>{row.spin}</td>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:"#ccc", fontSize:12 }}>{row.money}</td>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:row.color, fontWeight:700, fontSize:12 }}>{row.eval}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color:"#ffffff55", fontSize:11, margin:"0 0 8px" }}>▼ 1円パチ</p>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              {["1000円の回転数","50%に必要な金額","評価"].map(h=>(
                <th key={h} style={{ textAlign:"left", color:"#ffffff44", fontWeight:400, padding:"6px 8px", borderBottom:"1px solid #ffffff0f", fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { spin:"50回転",  money:"約4,700円", eval:"❌ 悪い",  color:"#ff4444" },
              { spin:"70回転",  money:"約3,300円", eval:"△ 普通",  color:"#ffcc00" },
              { spin:"90回転",  money:"約2,600円", eval:"○ 良い",  color:"#44ddaa" },
              { spin:"120回転", money:"約1,950円", eval:"◎ 優良",  color:"#44aaff" },
            ].map((row) => (
              <tr key={row.spin}>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:"#ccc", fontFamily:"'Zen Dots',monospace", fontSize:12 }}>{row.spin}</td>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:"#ccc", fontSize:12 }}>{row.money}</td>
                <td style={{ padding:"8px 8px", borderBottom:"1px solid #ffffff08", color:row.color, fontWeight:700, fontSize:12 }}>{row.eval}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color:"#ffffff33", fontSize:11, marginTop:10, marginBottom:0 }}>※ 1/399の台で計算</p>
      </Card>

      <Card tag="上位当たり" tagColor="#ff4444" title="RUSH突入率とは">
        <p style={{ color:"#ffffff77", fontSize:13, lineHeight:1.8, margin:"0 0 10px" }}>
          パチンコは「当たり」の中にランクがあります。当たっても外れ扱いになる「通常当たり」と、RUSHに突入する「上位当たり」です。
        </p>
        {[
          { label:"RUSH突入率の確認方法", desc:"台のスペック表（液晶横の説明板や公式サイト）に「RUSH突入率〇〇%」と記載されています。「データロボサイトセブン」などのアプリでも確認できます。", color:"#ff4444" },
          { label:"設定の使い方", desc:"計算ツールの「RUSH突入率を設定する」ボタンを開いて、台のRUSH突入率を入力してください。初当たり確率とRUSH到達確率の2つが同時に表示されます。", color:"#ff8800" },
          { label:"計算の仕組み", desc:"1回転ごとに「この回転でRUSHに入る確率 = 1÷確率分母 × RUSH突入率」として計算しています。複数回当たる可能性も考慮した正確な確率です。", color:"#ffcc00" },
        ].map((item) => (
          <div key={item.label} style={{ display:"flex", gap:12, marginBottom:14 }}>
            <div style={{ width:4, borderRadius:99, background:item.color, flexShrink:0, boxShadow:`0 0 8px ${item.color}` }}/>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:item.color, marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:12, color:"#ffffff66", lineHeight:1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
        <div style={{ background:"#ff444411", border:"1px solid #ff444422", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#ff4444aa", lineHeight:1.7 }}>
          💡 例：1/399でRUSH突入率60%の台なら、予算内で複数回当たる可能性も含めてRUSH到達確率を計算します。
        </div>
      </Card>

      <Card tag="注意" tagColor="#ff4444" title="このツールでできないこと">
        {["次の回転が当たるかどうかの予測","ハマり台が「そろそろ当たる」の保証","収支をプラスにする方法の提供"].map(text=>(
          <div key={text} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
            <span style={{ color:"#ff4444", flexShrink:0 }}>✕</span>
            <span style={{ fontSize:13, color:"#ffffff66" }}>{text}</span>
          </div>
        ))}
        <div style={{ marginTop:12, background:"#ff444411", border:"1px solid #ff444422", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#ff4444aa", lineHeight:1.7 }}>
          パチンコは長期的にホール側が有利な構造になっています。このツールは期待値の理解と予算管理を目的としています。無理のない範囲で楽しみましょう。
        </div>
      </Card>

      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <button onClick={()=>setPage("calc")} style={{
          display:"inline-block", background:"linear-gradient(135deg,#ff4444,#ff8800)",
          color:"#fff", fontWeight:700, fontSize:15, padding:"14px 40px", borderRadius:14,
          border:"none", cursor:"pointer", boxShadow:"0 4px 20px #ff444444",
        }}>
          🎰 計算ツールを使う
        </button>
      </div>

      <div style={{ fontSize:10, color:"#ffffff1a", textAlign:"center", lineHeight:1.8, paddingBottom:40 }}>
        当サイトはパチンコの確率計算を目的とした情報提供サービスです。<br/>
        ギャンブル依存症に関する相談は「ギャンブル等依存症相談窓口」をご利用ください。
      </div>
    </div>
  );
}

// ── プライバシーポリシーページ ──────────────────
function PrivacyPage({ setPage }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日`;

  const sections = [
    { title:"個人情報の収集について", body:"当サイト（PACHINKO CALC）は、ユーザーが直接入力した情報（確率・回転数・予算）をサーバーに送信・保存することはありません。すべての計算はお使いのブラウザ上でのみ行われます。" },
    { title:"アクセス解析ツールについて", body:"当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用する場合があります。このGoogleアナリティクスはデータ収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否できます。詳しくはGoogleのプライバシーポリシーをご確認ください。" },
    { title:"広告について", body:"当サイトは、第三者配信の広告サービス（Google AdSense）を利用する場合があります。広告配信事業者はCookieを使用して、ユーザーが過去にアクセスしたサイトの情報に基づいて広告を配信することがあります。GoogleがCookieを使用することにより、ユーザーがそのサイトや他のサイトにアクセスした際の情報に基づいて広告を配信することを、Googleの広告設定ページからオプトアウトできます。" },
    { title:"免責事項", body:"当サイトに掲載している計算結果・情報の正確性には万全を期しておりますが、その内容を保証するものではありません。当サイトの情報を利用して生じた損害について、一切の責任を負いかねます。また、パチンコは独立試行のため、当サイトの計算結果は将来の当選を保証するものではありません。パチンコ・パチスロは適度に楽しみ、のめり込まないようご注意ください。" },
    { title:"著作権について", body:"当サイトに掲載されているコンテンツ（テキスト・デザイン・プログラム等）の著作権は当サイト管理者に帰属します。無断転載・複製はご遠慮ください。" },
    { title:"プライバシーポリシーの変更", body:"当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは当ページに掲示された時点より効力を生じるものとします。" },
  ];

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 20px 0" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:"0 0 8px", color:"#fff" }}>プライバシーポリシー</h1>
        <p style={{ color:"#ffffff44", fontSize:12, margin:0 }}>制定日：{dateStr}</p>
      </div>
      {sections.map(({ title, body }) => (
        <div key={title} style={{ background:"#0f0f22", border:"1px solid #ffffff0f", borderRadius:16, padding:20, marginBottom:12 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:"#ffffff99", margin:"0 0 10px" }}>{title}</h2>
          <p style={{ fontSize:13, color:"#ffffff55", lineHeight:1.8, margin:0 }}>{body}</p>
        </div>
      ))}
      <div style={{ background:"#ff444409", border:"1px solid #ff444422", borderRadius:16, padding:20, marginBottom:12 }}>
        <h2 style={{ fontSize:14, fontWeight:700, color:"#ff6666aa", margin:"0 0 10px" }}>ギャンブル依存症でお悩みの方へ</h2>
        <p style={{ fontSize:13, color:"#ffffff44", lineHeight:1.8, margin:"0 0 10px" }}>ギャンブル等依存症に関するご相談は、以下の公的機関をご利用ください。</p>
        <div style={{ fontSize:13, color:"#ff6666aa", lineHeight:2 }}>
          <div>・ギャンブル等依存症相談窓口（各都道府県）</div>
          <div>・GA（ギャンブラーズ・アノニマス）日本</div>
          <div>・依存症対策全国センター</div>
        </div>
      </div>
      <div style={{ textAlign:"center", padding:"20px 0 40px" }}>
        <button onClick={()=>setPage("calc")} style={{
          display:"inline-block", background:"linear-gradient(135deg,#ff4444,#ff8800)",
          color:"#fff", fontWeight:700, fontSize:15, padding:"14px 40px", borderRadius:14,
          border:"none", cursor:"pointer", boxShadow:"0 4px 20px #ff444444",
        }}>🎰 計算ツールを使う</button>
      </div>
    </div>
  );
}

function Card({ tag, tagColor, title, children }) {
  return (
    <div style={{ background:"#0f0f22", border:"1px solid #ffffff0f", borderRadius:16, padding:20, marginBottom:14 }}>
      <div style={{ display:"inline-block", fontSize:10, padding:"2px 10px", borderRadius:99, fontWeight:700,
        letterSpacing:1, marginBottom:10, background:tagColor+"22", color:tagColor, border:`1px solid ${tagColor}33` }}>
        {tag}
      </div>
      <h2 style={{ fontSize:16, color:"#fff", margin:"0 0 12px" }}>{title}</h2>
      {children}
    </div>
  );
}

// ── 用語集ページ ────────────────────────────────
function GlossaryPage({ setPage }) {
  const terms = [
    { term:"大当り確率", reading:"おおあたりかくりつ", color:"#44aaff", desc:"1回転ごとに行われる抽選で当たりが出る確率。「1/399」なら1回転で399分の1の確率で当たる。分母が小さいほど当たりやすい。" },
    { term:"ST（スペシャルタイム）", reading:"エスティー", color:"#ff4444", desc:"通常より確率が上がった状態のこと。ST中は大当り確率が高くなり、連チャンしやすくなる。「ST100回転」なら100回転の間、高確率が続く。" },
    { term:"RUSH（ラッシュ）", reading:"ラッシュ", color:"#ff8800", desc:"STと同じく高確率状態のこと。最近の台ではSTよりRUSHと呼ぶことが多い。RUSHに入ると連チャンが期待できる。" },
    { term:"LT（ラッキートリガー）", reading:"エルティー", color:"#ff44aa", desc:"比較的新しい仕様で、通常時でもRUSHに突入できる仕組み。特定の条件を満たすとLTが発動してRUSHに入れることがある。" },
    { term:"確変（確率変動）", reading:"かくへん", color:"#ffcc00", desc:"大当り後に確率が変動してSTやRUSHに入る仕組み。「確変突入率60%」なら当たりの60%が上位当たりでRUSHに入れる。" },
    { term:"ボーダー", reading:"ボーダー", color:"#44ddaa", desc:"損益分岐点となる1000円あたりの回転数のこと。ボーダー以上回れば期待値プラス、以下なら期待値マイナスの台と判断できる。" },
    { term:"回転数", reading:"かいてんすう", color:"#44ddaa", desc:"1000円あたりに何回転するかを表す数字。釘の調整で変わる。4円パチは平均18〜22回転、1円パチは50〜100回転が目安。" },
    { term:"ハマり", reading:"ハマり", color:"#ff5500", desc:"確率の分母を大きく超えても当たらない状態のこと。1/399の台で800回転以上当たらない場合など。ただし確率は独立試行なので「そろそろ当たる」は数学的に正しくない。" },
    { term:"釘（くぎ）", reading:"くぎ", color:"#ffffff88", desc:"盤面にある金属の釘のこと。釘の調整次第で回転数が変わる。釘が開いている＝回転数が多い＝有利な台。" },
    { term:"等倍（とうばい）", reading:"とうばい", color:"#ffcc00", desc:"確率通りに1回当たるのに必要な金額を使った状態。63%の当選確率に相当する。等倍以上回せている台は比較的釘が良い。" },
    { term:"4円パチ（よえんぱち）", reading:"よえんぱち", color:"#44aaff", desc:"1玉4円で遊ぶ通常のパチンコ。射幸性が高く、大きく勝つこともあるが負けも大きい。" },
    { term:"1円パチ（いちえんぱち）", reading:"いちえんぱち", color:"#44ddaa", desc:"1玉1円で遊ぶパチンコ。4円パチより安く長く遊べるが、出玉の価値も4分の1になる。" },
  ];

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 20px 0" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:"0 0 8px", color:"#fff" }}>パチンコ用語集</h1>
        <p style={{ color:"#ffffff88", fontSize:14, lineHeight:1.8, margin:0 }}>
          パチンコでよく使われる用語をわかりやすく解説します。
        </p>
      </div>

      {terms.map(({ term, reading, color, desc }) => (
        <div key={term} style={{ background:"#0f0f22", border:"1px solid #ffffff0f", borderRadius:16, padding:"16px 20px", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:16, fontWeight:900, color }}>{term}</span>
            <span style={{ fontSize:11, color:"#ffffff33" }}>（{reading}）</span>
          </div>
          <p style={{ fontSize:13, color:"#ffffff66", lineHeight:1.8, margin:0 }}>{desc}</p>
        </div>
      ))}

      <div style={{ textAlign:"center", padding:"20px 0 40px" }}>
        <button onClick={()=>setPage("calc")} style={{
          display:"inline-block", background:"linear-gradient(135deg,#ff4444,#ff8800)",
          color:"#fff", fontWeight:700, fontSize:15, padding:"14px 40px", borderRadius:14,
          border:"none", cursor:"pointer", boxShadow:"0 4px 20px #ff444444",
        }}>🎰 計算ツールを使う</button>
      </div>
    </div>
  );
}

// ── スペック解説ページ ──────────────────────────
function SpecPage({ setPage }) {
  const specs = [
    {
      name:"ライトミドル", color:"#44aaff",
      rate:"1/199〜1/250", rush:"60〜80%", st:"100回転前後",
      desc:"初心者から中級者向けの人気スペック。当たりやすくRUSH突入率も高め。バランスがよく長く遊びやすい。",
    },
    {
      name:"ミドル", color:"#ffcc00",
      rate:"1/319〜1/399", rush:"60〜80%", st:"100回転前後",
      desc:"パチンコの標準スペック。当たりにくいが出玉が大きい。ある程度の資金が必要で上級者向け。",
    },
    {
      name:"ハイミドル", color:"#ff8800",
      rate:"1/350〜1/450", rush:"70〜100%", st:"100〜150回転",
      desc:"ミドルより当たりにくいが出玉が多め。RUSHに入ると大量出玉が期待できるロマン仕様。",
    },
    {
      name:"甘デジ（ライト）", color:"#44ddaa",
      rate:"1/99〜1/150", rush:"50〜65%", st:"50〜100回転",
      desc:"当たりやすく少ない予算でも楽しめる。出玉は少なめだが回転率が高く長時間遊べる。1パチと相性がいい。",
    },
    {
      name:"MAX（マックス）", color:"#ff4444",
      rate:"1/500以上", rush:"80〜100%", st:"100回転以上",
      desc:"最も当たりにくいスペック。一発逆転を狙うロマン台。資金に余裕がある上級者向け。",
    },
  ];

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 20px 0" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:"0 0 8px", color:"#fff" }}>パチンコスペック解説</h1>
        <p style={{ color:"#ffffff88", fontSize:14, lineHeight:1.8, margin:0 }}>
          台のスペックの種類と特徴をまとめました。自分のスタイルに合った台選びの参考にしてください。
        </p>
      </div>

      {specs.map(({ name, color, rate, rush, st, desc }) => (
        <div key={name} style={{ background:"#0f0f22", border:`1px solid ${color}22`, borderRadius:16, padding:"16px 20px", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:4, borderRadius:99, alignSelf:"stretch", background:color, boxShadow:`0 0 8px ${color}` }}/>
            <h2 style={{ fontSize:16, fontWeight:900, color, margin:0 }}>{name}</h2>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            {[
              { label:"大当り確率", value:rate },
              { label:"RUSH突入率", value:rush },
              { label:"ST回転数", value:st },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:color+"11", border:`1px solid ${color}22`, borderRadius:8, padding:"6px 10px" }}>
                <div style={{ fontSize:10, color:color+"88", marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color, fontFamily:"'Zen Dots',monospace" }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:13, color:"#ffffff66", lineHeight:1.8, margin:0 }}>{desc}</p>
        </div>
      ))}

      <div style={{ background:"#ffffff08", border:"1px solid #ffffff11", borderRadius:16, padding:"16px 20px", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#ffffff88", marginBottom:10 }}>💡 台選びのポイント</div>
        {[
          "予算が少ない → 甘デジ・ライトミドル",
          "バランスよく遊びたい → ライトミドル・ミドル",
          "一発逆転を狙いたい → ハイミドル・MAX",
          "1パチで遊ぶ → 甘デジが特におすすめ",
        ].map(text => (
          <div key={text} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13, color:"#ffffff55" }}>
            <span style={{ color:"#44ddaa", flexShrink:0 }}>✓</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign:"center", padding:"20px 0 40px" }}>
        <button onClick={()=>setPage("calc")} style={{
          display:"inline-block", background:"linear-gradient(135deg,#ff4444,#ff8800)",
          color:"#fff", fontWeight:700, fontSize:15, padding:"14px 40px", borderRadius:14,
          border:"none", cursor:"pointer", boxShadow:"0 4px 20px #ff444444",
        }}>🎰 計算ツールを使う</button>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <div style={{ borderTop:"1px solid #ffffff08", padding:"16px 20px", marginTop:20 }}>
      <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
        {[
          { label:"用語集", page:"glossary" },
          { label:"スペック解説", page:"spec" },
          { label:"プライバシーポリシー", page:"privacy" },
        ].map(({ label, page }) => (
          <button key={page} onClick={() => setPage(page)} style={{
            background:"none", border:"none", color:"#ffffff55", fontSize:11,
            cursor:"pointer", textDecoration:"underline", fontFamily:"'Noto Sans JP',sans-serif",
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("calc");
  return (
    <div style={{ minHeight:"100vh", background:"#07070f", color:"#e8e8f0", fontFamily:"'Noto Sans JP',sans-serif", paddingBottom:60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Zen+Dots&display=swap" rel="stylesheet"/>
      <style>{`input[type=range]{-webkit-appearance:none;appearance:none}*{box-sizing:border-box}@keyframes rainbow{0%{color:#ff4444}14%{color:#ff8800}28%{color:#ffcc00}42%{color:#44ddaa}57%{color:#44aaff}71%{color:#aa44ff}85%{color:#ff44aa}100%{color:#ff4444}}.rainbow-btn{animation:rainbow 3s linear infinite}`}</style>
      <Header page={page} setPage={setPage}/>
      {page === "calc" && <CalcPage setPage={setPage}/>}
      {page === "guide" && <GuidePage setPage={setPage}/>}
      {page === "glossary" && <GlossaryPage setPage={setPage}/>}
      {page === "spec" && <SpecPage setPage={setPage}/>}
      {page === "privacy" && <PrivacyPage setPage={setPage}/>}
      <Footer setPage={setPage}/>
    </div>
  );
}
