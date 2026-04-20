import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

const THEMES = ['radical', 'dark', 'tokyonight', 'merko', 'gruvbox', 'onedark', 'cobalt', 'synthwave', 'highcontrast', 'dracula'];
const SKILL_OPTIONS = ['JavaScript','TypeScript','React','Next.js','Node.js','Python','Java','C++','Go','Rust','PHP','HTML','CSS','SQL','MongoDB','PostgreSQL','MySQL','Docker','Kubernetes','AWS','Git','Linux','Vue','Angular','GraphQL','Redis','Firebase','TailwindCSS','Flutter','Swift','Kotlin'];

function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#3d1a1a' : '#0d2a1a',
          border: `1px solid ${t.type === 'error' ? '#f85149' : '#3fb950'}`,
          color: t.type === 'error' ? '#f85149' : '#3fb950',
          padding: '12px 20px', borderRadius: 8, fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace', maxWidth: 360,
          animation: 'slideIn 0.3s ease',
        }}>
          {t.type === 'error' ? '✗ ' : '✓ '}{t.msg}
        </div>
      ))}
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 40, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 75 ? '#3fb950' : score >= 50 ? '#e3b341' : '#f85149';
  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#21262d" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700 }}>{score}%</span>
        <span style={{ color: '#8b949e', fontSize: 10 }}>Score</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [actionLoading, setActionLoading] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({ name:'', bio:'', location:'', blog:'', twitter_username:'', company:'' });
  // README form
  const [readmeForm, setReadmeForm] = useState({
    tagline: 'Passionate Developer | Open Source Enthusiast',
    skills: ['JavaScript', 'React', 'Node.js'],
    github_stats_theme: 'radical',
    show_streak: true, show_langs: true, show_trophies: true,
    social: { linkedin:'', twitter:'', portfolio:'', email:'' },
  });

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/status');
      const d = await r.json();
      if (d.error) { toast(d.error, 'error'); setLoading(false); return; }
      setStatus(d);
      setProfileForm({
        name: d.user.name || '',
        bio: d.user.bio || '',
        location: d.user.location || '',
        blog: d.user.blog || '',
        twitter_username: d.user.twitter_username || '',
        company: d.user.company || '',
      });
      setReadmeForm((p) => ({ ...p, title: `Hi there, I'm ${d.user.login} 👋` }));
    } catch (e) { toast(e.message, 'error'); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const updateProfile = async () => {
    setActionLoading('profile');
    try {
      const r = await fetch('/api/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(profileForm) });
      const d = await r.json();
      if (d.error) toast(d.error, 'error');
      else { toast('Profile updated successfully!'); fetchStatus(); }
    } catch(e) { toast(e.message,'error'); }
    setActionLoading('');
  };

  const generateReadme = async () => {
    setActionLoading('readme');
    try {
      const r = await fetch('/api/readme', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(readmeForm) });
      const d = await r.json();
      if (d.error) toast(d.error, 'error');
      else toast(`README pushed! Visit github.com/${d.username}`);
    } catch(e) { toast(e.message,'error'); }
    setActionLoading('');
  };

  const enhanceRepos = async () => {
    setActionLoading('repos');
    try {
      const r = await fetch('/api/repos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mode:'all' }) });
      const d = await r.json();
      if (d.error) toast(d.error, 'error');
      else { toast(`Enhanced ${d.enhanced} repos!`); fetchStatus(); }
    } catch(e) { toast(e.message,'error'); }
    setActionLoading('');
  };

  const toggleSkill = (skill) => {
    setReadmeForm((p) => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter((s) => s !== skill) : [...p.skills, skill],
    }));
  };

  const s = {
    body: { margin:0, background:'#0d1117', color:'#e6edf3', minHeight:'100vh', fontFamily:'Outfit, sans-serif' },
    nav: { background:'#161b22', borderBottom:'1px solid #30363d', padding:'0 32px', display:'flex', alignItems:'center', gap:24, height:60, position:'sticky', top:0, zIndex:100 },
    logo: { fontFamily:'JetBrains Mono, monospace', fontWeight:700, fontSize:18, color:'#58a6ff', display:'flex', alignItems:'center', gap:8 },
    navUser: { marginLeft:'auto', display:'flex', alignItems:'center', gap:12 },
    avatar: { width:32, height:32, borderRadius:'50%', border:'2px solid #30363d' },
    statusDot: { width:8, height:8, borderRadius:'50%', background:'#3fb950', boxShadow:'0 0 6px #3fb950' },
    main: { maxWidth:1100, margin:'0 auto', padding:'32px 24px' },
    tabs: { display:'flex', gap:4, marginBottom:32, background:'#161b22', padding:6, borderRadius:10, border:'1px solid #30363d', width:'fit-content' },
    tab: (active) => ({ padding:'8px 20px', borderRadius:7, cursor:'pointer', fontSize:14, fontWeight:500, transition:'all 0.2s',
      background: active ? '#21262d' : 'transparent',
      color: active ? '#e6edf3' : '#8b949e',
      border: active ? '1px solid #30363d' : '1px solid transparent' }),
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20 },
    card: { background:'#161b22', border:'1px solid #30363d', borderRadius:12, padding:24, transition:'border-color 0.2s' },
    cardTitle: { fontFamily:'JetBrains Mono, monospace', fontSize:13, color:'#8b949e', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 },
    label: { fontSize:13, color:'#8b949e', marginBottom:6, display:'block' },
    input: { width:'100%', background:'#0d1117', border:'1px solid #30363d', borderRadius:8, padding:'10px 14px', color:'#e6edf3', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s' },
    btn: (variant='primary', loading=false) => ({
      padding:'10px 24px', borderRadius:8, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize:14, fontWeight:600, transition:'all 0.2s', opacity: loading ? 0.6 : 1,
      background: variant==='primary' ? '#238636' : variant==='blue' ? '#1f6feb' : '#21262d',
      color: '#fff',
    }),
    badge: (color='#3fb950') => ({ background: color+'22', color, border:`1px solid ${color}44`, padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:500 }),
    progressBar: (val, max, color='#3fb950') => ({
      height:6, borderRadius:3, background: color, width: `${(val/max)*100}%`, transition:'width 0.8s ease',
    }),
    skillChip: (selected) => ({
      padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500, transition:'all 0.2s',
      background: selected ? '#1f6feb33' : '#21262d',
      border: `1px solid ${selected ? '#58a6ff' : '#30363d'}`,
      color: selected ? '#58a6ff' : '#8b949e',
    }),
    statNum: { fontFamily:'JetBrains Mono, monospace', fontSize:28, fontWeight:700, color:'#e6edf3' },
    statLabel: { fontSize:12, color:'#8b949e', marginTop:4 },
    checkItem: (pass) => ({ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #21262d', color: pass ? '#e6edf3' : '#8b949e', fontSize:14 }),
    checkIcon: (pass) => ({ width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: pass ? '#1a3a1a' : '#21262d', color: pass ? '#3fb950' : '#484f58', fontSize:11, flexShrink:0 }),
  };

  if (loading) return (
    <div style={{ ...s.body, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'JetBrains Mono, monospace', color:'#58a6ff', fontSize:20, marginBottom:16 }}>⚡ GitHub Enhancer</div>
        <div style={{ color:'#8b949e', fontSize:14 }}>Fetching your profile...</div>
        <div style={{ marginTop:16, display:'flex', gap:6, justifyContent:'center' }}>
          {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#58a6ff', animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>⚡ GitHub Account Enhancer</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; }
          body { margin:0; }
          input:focus { border-color:#58a6ff !important; }
          textarea:focus { border-color:#58a6ff !important; }
          select:focus { border-color:#58a6ff !important; }
          @keyframes pulse { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
          @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
          @keyframes fadeUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
          .card-hover:hover { border-color:#58a6ff !important; }
          .btn-hover:hover { filter:brightness(1.15); transform:translateY(-1px); }
          select option { background:#161b22; }
        `}</style>
      </Head>
      <div style={s.body}>
        {/* NAV */}
        <nav style={s.nav}>
          <div style={s.logo}><span>⚡</span><span>GitHub Enhancer</span></div>
          {status && (
            <div style={s.navUser}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={s.statusDot} />
                <span style={{ color:'#8b949e', fontSize:13, fontFamily:'JetBrains Mono, monospace' }}>Connected</span>
              </div>
              <img src={status.user.avatar_url} style={s.avatar} alt="avatar" />
              <span style={{ fontSize:14, fontWeight:600 }}>@{status.user.login}</span>
            </div>
          )}
        </nav>

        <div style={s.main}>
          {/* TABS */}
          <div style={s.tabs}>
            {[['dashboard','📊 Dashboard'],['profile','👤 Profile'],['readme','📝 README'],['repos','📦 Repos']].map(([key,label]) => (
              <button key={key} style={s.tab(tab===key)} onClick={()=>setTab(key)}>{label}</button>
            ))}
          </div>

          {/* DASHBOARD */}
          {tab === 'dashboard' && status && (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ display:'flex', gap:20, marginBottom:24, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ ...s.card, display:'flex', gap:24, alignItems:'center', flex:1, minWidth:280 }} className="card-hover">
                  <ScoreRing score={status.score} />
                  <div>
                    <div style={{ fontSize:22, fontWeight:700 }}>Profile Score</div>
                    <div style={{ color:'#8b949e', fontSize:13, marginTop:4 }}>
                      {status.score < 50 ? '🔴 Needs attention' : status.score < 75 ? '🟡 Getting better' : '🟢 Looking great!'}
                    </div>
                    <div style={{ marginTop:12, display:'flex', gap:8 }}>
                      <button style={s.btn('primary')} className="btn-hover" onClick={()=>setTab('profile')}>Enhance Profile →</button>
                    </div>
                  </div>
                </div>

                <div style={{ ...s.card, flex:2, minWidth:280 }} className="card-hover">
                  <div style={s.cardTitle}>📋 Profile Checklist</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                    {Object.entries({ 'Full Name': status.checks.name, 'Bio': status.checks.bio, 'Location': status.checks.location, 'Website': status.checks.blog, 'Twitter': status.checks.twitter, 'Email': status.checks.email, 'Company': status.checks.company, 'Custom Avatar': status.checks.avatar }).map(([k,v]) => (
                      <div key={k} style={s.checkItem(v)}>
                        <div style={s.checkIcon(v)}>{v ? '✓' : '✗'}</div>
                        <span>{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={s.grid}>
                <div style={s.card} className="card-hover">
                  <div style={s.cardTitle}>📦 Repository Stats</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                    {[['Total Repos', status.repoStats.total, '#58a6ff'],['With Description', status.repoStats.withDesc, '#3fb950'],['With Topics', status.repoStats.withTopics, '#e3b341'],['Empty Repos', status.repoStats.empty, '#f85149']].map(([l,v,c]) => (
                      <div key={l} style={{ textAlign:'center', padding:16, background:'#0d1117', borderRadius:8, border:`1px solid ${c}22` }}>
                        <div style={{ ...s.statNum, color:c }}>{v}</div>
                        <div style={s.statLabel}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8b949e', marginBottom:6 }}>
                      <span>Repos with descriptions</span>
                      <span>{status.repoStats.withDesc}/{status.repoStats.total}</span>
                    </div>
                    <div style={{ background:'#21262d', borderRadius:3, height:6, overflow:'hidden' }}>
                      <div style={s.progressBar(status.repoStats.withDesc, Math.max(status.repoStats.total,1))} />
                    </div>
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8b949e', marginBottom:6 }}>
                      <span>Repos with topics</span>
                      <span>{status.repoStats.withTopics}/{status.repoStats.total}</span>
                    </div>
                    <div style={{ background:'#21262d', borderRadius:3, height:6, overflow:'hidden' }}>
                      <div style={s.progressBar(status.repoStats.withTopics, Math.max(status.repoStats.total,1), '#e3b341')} />
                    </div>
                  </div>
                  <button style={{ ...s.btn('blue', actionLoading==='repos'), width:'100%' }} className="btn-hover"
                    onClick={enhanceRepos} disabled={actionLoading==='repos'}>
                    {actionLoading==='repos' ? '⏳ Enhancing...' : '🚀 Bulk Enhance All Repos'}
                  </button>
                </div>

                <div style={s.card} className="card-hover">
                  <div style={s.cardTitle}>👤 Account Overview</div>
                  <div style={{ display:'flex', gap:16, marginBottom:20 }}>
                    <img src={status.user.avatar_url} style={{ width:72, height:72, borderRadius:12, border:'2px solid #30363d' }} alt="av" />
                    <div>
                      <div style={{ fontWeight:700, fontSize:18 }}>{status.user.name || status.user.login}</div>
                      <div style={{ color:'#58a6ff', fontSize:13, fontFamily:'JetBrains Mono' }}>@{status.user.login}</div>
                      <div style={{ color:'#8b949e', fontSize:13, marginTop:4 }}>{status.user.bio || <i>No bio set</i>}</div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
                    {[['Repos', status.user.public_repos],['Followers', status.user.followers],['Following', status.user.following]].map(([l,v]) => (
                      <div key={l} style={{ textAlign:'center', padding:12, background:'#0d1117', borderRadius:8 }}>
                        <div style={{ fontFamily:'JetBrains Mono, monospace', fontWeight:700, fontSize:18, color:'#e6edf3' }}>{v}</div>
                        <div style={{ fontSize:11, color:'#8b949e', marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <a href={`https://github.com/${status.user.login}`} target="_blank" rel="noreferrer"
                    style={{ display:'block', textAlign:'center', padding:'10px', background:'#21262d', border:'1px solid #30363d', borderRadius:8, color:'#e6edf3', textDecoration:'none', fontSize:14, fontWeight:600, transition:'all 0.2s' }}>
                    View GitHub Profile →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ maxWidth:640 }}>
                <div style={{ ...s.card, marginBottom:20 }} className="card-hover">
                  <div style={s.cardTitle}>✏️ Update Profile Info</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {[['Full Name','name','text','John Doe'],['Company/College','company','text','@ Acme Corp'],['Location','location','text','Mumbai, India'],['Website / Portfolio','blog','url','https://yoursite.com'],['Twitter Username','twitter_username','text','yourtwitterhandle']].map(([label,key,type,ph]) => (
                      <div key={key}>
                        <label style={s.label}>{label}</label>
                        <input style={s.input} type={type} placeholder={ph} value={profileForm[key]||''}
                          onChange={e=>setProfileForm(p=>({...p,[key]:e.target.value}))} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:16 }}>
                    <label style={s.label}>Bio (max 160 chars)</label>
                    <textarea style={{ ...s.input, resize:'vertical', minHeight:80 }} maxLength={160}
                      placeholder="Full Stack Developer | Building cool stuff | Open to opportunities"
                      value={profileForm.bio||''} onChange={e=>setProfileForm(p=>({...p,bio:e.target.value}))} />
                    <div style={{ textAlign:'right', fontSize:11, color:'#484f58', marginTop:4 }}>{(profileForm.bio||'').length}/160</div>
                  </div>
                  <button style={{ ...s.btn('primary', actionLoading==='profile'), marginTop:20, width:'100%' }}
                    className="btn-hover" onClick={updateProfile} disabled={actionLoading==='profile'}>
                    {actionLoading==='profile' ? '⏳ Updating...' : '💾 Save Profile Changes'}
                  </button>
                </div>

                <div style={{ ...s.card, background:'#0f1f0f', border:'1px solid #1a3a1a' }}>
                  <div style={{ color:'#3fb950', fontWeight:600, marginBottom:8 }}>💡 Pro Tips for Placement</div>
                  <ul style={{ color:'#8b949e', fontSize:13, paddingLeft:20, margin:0, lineHeight:1.8 }}>
                    <li>Bio mein <b style={{color:'#e6edf3'}}>role + tech + status</b> likho: "MERN Dev | DSA | Open to Work"</li>
                    <li>Location se <b style={{color:'#e6edf3'}}>local companies</b> tumhe easily find kar sakti hain</li>
                    <li>Portfolio URL <b style={{color:'#e6edf3'}}>zaroor</b> add karo — recruiters click karte hain</li>
                    <li>Twitter/X handle se <b style={{color:'#e6edf3'}}>professional network</b> visible hota hai</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* README TAB */}
          {tab === 'readme' && (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={s.grid}>
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={s.card} className="card-hover">
                    <div style={s.cardTitle}>📝 README Settings</div>
                    <label style={s.label}>Tagline</label>
                    <input style={{ ...s.input, marginBottom:16 }} placeholder="Passionate Developer | Open Source Enthusiast"
                      value={readmeForm.tagline} onChange={e=>setReadmeForm(p=>({...p,tagline:e.target.value}))} />

                    <label style={s.label}>GitHub Stats Theme</label>
                    <select style={{ ...s.input, marginBottom:16 }} value={readmeForm.github_stats_theme}
                      onChange={e=>setReadmeForm(p=>({...p,github_stats_theme:e.target.value}))}>
                      {THEMES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>

                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
                      {[['show_streak','🔥 Streak'],['show_langs','💬 Languages'],['show_trophies','🏆 Trophies']].map(([key,label])=>(
                        <label key={key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, color:'#8b949e' }}>
                          <input type="checkbox" checked={readmeForm[key]} onChange={e=>setReadmeForm(p=>({...p,[key]:e.target.checked}))} style={{ accentColor:'#58a6ff' }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={s.card} className="card-hover">
                    <div style={s.cardTitle}>🌐 Social Links (Optional)</div>
                    {[['LinkedIn URL','linkedin','https://linkedin.com/in/yourname'],['Twitter Handle','twitter','yourtwitterhandle'],['Portfolio URL','portfolio','https://yourportfolio.com'],['Email','email','you@gmail.com']].map(([label,key,ph])=>(
                      <div key={key} style={{ marginBottom:12 }}>
                        <label style={s.label}>{label}</label>
                        <input style={s.input} placeholder={ph} value={readmeForm.social[key]||''}
                          onChange={e=>setReadmeForm(p=>({...p,social:{...p.social,[key]:e.target.value}}))} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={s.card} className="card-hover">
                    <div style={s.cardTitle}>🛠️ Select Your Skills</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {SKILL_OPTIONS.map(skill=>(
                        <button key={skill} style={s.skillChip(readmeForm.skills.includes(skill))} onClick={()=>toggleSkill(skill)}>
                          {skill}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop:12, fontSize:12, color:'#484f58' }}>{readmeForm.skills.length} skills selected</div>
                  </div>

                  <div style={{ ...s.card, background:'#0d1a2e', border:'1px solid #1f3a5f' }} className="card-hover">
                    <div style={{ color:'#58a6ff', fontWeight:600, marginBottom:8 }}>📋 What will be generated</div>
                    <ul style={{ color:'#8b949e', fontSize:13, paddingLeft:20, margin:0, lineHeight:2 }}>
                      <li>Animated header with your name</li>
                      <li>Tech stack badges for {readmeForm.skills.length} selected skills</li>
                      <li>GitHub stats card ({readmeForm.github_stats_theme} theme)</li>
                      {readmeForm.show_streak && <li>Contribution streak chart</li>}
                      {readmeForm.show_langs && <li>Top programming languages</li>}
                      {readmeForm.show_trophies && <li>GitHub achievement trophies</li>}
                      <li>Profile visitor counter</li>
                      {Object.values(readmeForm.social).some(Boolean) && <li>Social media badges</li>}
                    </ul>
                    <button style={{ ...s.btn('primary', actionLoading==='readme'), width:'100%', marginTop:20 }}
                      className="btn-hover" onClick={generateReadme} disabled={actionLoading==='readme'}>
                      {actionLoading==='readme' ? '⏳ Generating & Pushing...' : '🚀 Generate & Push README'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPOS TAB */}
          {tab === 'repos' && status && (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ display:'flex', gap:20, marginBottom:24, flexWrap:'wrap' }}>
                {[['📦 Total Repos', status.repoStats.total, '#58a6ff'],['✅ With Desc', status.repoStats.withDesc, '#3fb950'],['🏷️ With Topics', status.repoStats.withTopics, '#e3b341'],['💀 Empty', status.repoStats.empty, '#f85149']].map(([l,v,c])=>(
                  <div key={l} style={{ ...s.card, textAlign:'center', flex:1, minWidth:140, borderColor:`${c}44` }} className="card-hover">
                    <div style={{ ...s.statNum, color:c }}>{v}</div>
                    <div style={{ fontSize:13, color:'#8b949e', marginTop:4 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...s.card, marginBottom:20 }} className="card-hover">
                <div style={s.cardTitle}>🚀 Bulk Repository Enhancement</div>
                <div style={{ color:'#8b949e', fontSize:14, marginBottom:20, lineHeight:1.7 }}>
                  Ek click mein <b style={{color:'#e6edf3'}}>saare repos</b> enhance ho jayenge:<br/>
                  <span style={{ color:'#3fb950' }}>✓</span> Auto-descriptions generate hogi (language-based)<br/>
                  <span style={{ color:'#3fb950' }}>✓</span> Relevant topics/tags add honge (JavaScript, React, etc.)<br/>
                  <span style={{ color:'#e3b341' }}>⚠</span> Existing descriptions & topics preserve rahenge
                </div>
                <button style={{ ...s.btn('primary', actionLoading==='repos'), padding:'14px 32px', fontSize:16 }}
                  className="btn-hover" onClick={enhanceRepos} disabled={actionLoading==='repos'}>
                  {actionLoading==='repos' ? '⏳ Enhancing all repos...' : '⚡ Enhance All Repositories'}
                </button>
              </div>

              <div style={{ ...s.card, background:'#21262d' }}>
                <div style={s.cardTitle}>📁 Repository List</div>
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {status.repos.slice(0,20).map((repo,i) => (
                    <div key={repo.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0',
                      borderBottom: i < 19 ? '1px solid #21262d' : 'none' }}>
                      <div style={{ flex:1 }}>
                        <a href={repo.html_url} target="_blank" rel="noreferrer"
                          style={{ color:'#58a6ff', fontWeight:600, fontSize:14, textDecoration:'none' }}>{repo.name}</a>
                        <div style={{ color:'#8b949e', fontSize:12, marginTop:3 }}>{repo.description || <i style={{color:'#484f58'}}>No description</i>}</div>
                        {repo.topics?.length > 0 && (
                          <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap' }}>
                            {repo.topics.slice(0,5).map(t=>(
                              <span key={t} style={{ background:'#1f3a5f', color:'#58a6ff', padding:'1px 8px', borderRadius:20, fontSize:11 }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                        {repo.language && <span style={s.badge('#8b949e')}>{repo.language}</span>}
                        {!repo.description && <span style={s.badge('#f85149')}>No desc</span>}
                        {!repo.topics?.length && <span style={s.badge('#e3b341')}>No topics</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <Toast toasts={toasts} />
      </div>
    </>
  );
}
