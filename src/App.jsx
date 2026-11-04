import { useEffect, useState } from 'react'
import { BookOpen, Brain, ClipboardList, GraduationCap, LayoutDashboard, LogOut, Menu, UserRound, X, Sparkles, LockKeyhole } from 'lucide-react'
import { supabase } from './lib/supabase'

const levels = ['Primary 1–6', 'JSS 1–3', 'SS 1–3', 'JAMB', 'WAEC', 'NECO', 'Tertiary']
const nav = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'notes', label: 'My notes', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Brain },
  { id: 'quizzes', label: 'Quizzes', icon: ClipboardList },
  { id: 'cbt', label: 'CBT practice', icon: GraduationCap },
  { id: 'profile', label: 'My profile', icon: UserRound },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || !supabase) { setProfile(null); return }
    supabase.from('profiles').select('full_name, education_level').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [session])

  async function authenticate(e) {
    e.preventDefault()
    if (!supabase) return setNotice('Add your Supabase URL and publishable key to .env first.')
    setBusy(true); setNotice('')
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (result.error) setNotice(result.error.message)
    else if (authMode === 'signup') setNotice('Account created. Check your email if confirmation is enabled, then sign in.')
  }

  async function signOut() { await supabase?.auth.signOut(); setPage('home') }

  if (!session) return <AuthScreen {...{authMode,setAuthMode,email,setEmail,password,setPassword,fullName,setFullName,busy,notice,authenticate}} />

  const current = nav.find(n => n.id === page)
  return <div className="app-shell">
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><BookOpen size={21}/></span><span>Study<span className="gold">Deck</span></span><button className="icon-btn close-menu" onClick={() => setMobileOpen(false)}><X/></button></div>
      <div className="nav-caption">LEARNING SPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-item ${page===item.id?'active':''}`} onClick={() => {setPage(item.id);setMobileOpen(false)}}><item.icon size={18}/>{item.label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="premium-mini"><Sparkles size={18}/><b>Keep growing</b><p>Premium learning tools are coming soon.</p><span>COMING SOON</span></div><button className="nav-item" onClick={signOut}><LogOut size={18}/>Sign out</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setMobileOpen(true)}><Menu/></button><div className="crumb">Learning space <span>/</span> {current?.label}</div><div className="avatar">{(profile?.full_name || session.user.email || 'S')[0].toUpperCase()}</div></header>
      <div className="content">
        {page==='home' && <><section className="welcome"><div><div className="eyebrow">YOUR LEARNING JOURNEY</div><h1>Small steps. <em>Big results.</em></h1><p>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}. Ready to make today count?</p></div><div className="welcome-art"><GraduationCap size={78}/><span>✦</span></div></section>
          <div className="section-heading"><div><h2>Your study space</h2><p>Choose where you want to begin.</p></div></div>
          <div className="feature-grid">{[
            ['notes','My notes','Save and organise your learning materials.',BookOpen],
            ['flashcards','Flashcards','Remember more with active recall.',Brain],
            ['quizzes','Quick quizzes','Test what you know as you learn.',ClipboardList],
            ['cbt','CBT practice','Prepare for WAEC, NECO and JAMB.',GraduationCap],
          ].map(([id,title,desc,Icon])=><button className="feature-card" key={id} onClick={()=>setPage(id)}><span className="feature-icon"><Icon size={22}/></span><h3>{title}</h3><p>{desc}</p><span className="card-arrow">Explore <span>→</span></span></button>)}</div>
          <section className="level-panel"><div><div className="eyebrow">MADE FOR YOUR STAGE</div><h2>Learning that meets you where you are.</h2><p>Choose your education level in your profile as we build out your personalised study plan.</p></div><div className="level-pills">{levels.map(x=><span key={x}>{x}</span>)}</div></section>
        </>}
        {page==='profile' && <section className="page-panel"><div className="eyebrow">YOUR ACCOUNT</div><h1>My profile</h1><p className="muted">Your sign-in details and learning stage.</p><div className="profile-row"><div className="avatar large">{(profile?.full_name || session.user.email || 'S')[0].toUpperCase()}</div><div><b>{profile?.full_name || 'Learner'}</b><p>{session.user.email}</p></div></div><div className="info-line"><span>Education level</span><b>{profile?.education_level || 'Not selected yet'}</b></div><button className="primary-btn" onClick={signOut}>Sign out</button></section>}
        {['notes','flashcards','quizzes','cbt'].includes(page) && <section className="page-panel coming-panel"><span className="feature-icon"><LockKeyhole size={24}/></span><div className="eyebrow">COMING IN THE NEXT BUILD</div><h1>{current?.label}</h1><p className="muted">Your {current?.label.toLowerCase()} workspace is part of the StudyDeck roadmap. The account foundation is ready; we’ll add the content tools and progress tracking next.</p><button className="secondary-btn" onClick={()=>setPage('home')}>Back to dashboard</button></section>}
      </div>
      <footer>StudyDeck <span>•</span> Learn smarter, one day at a time.</footer>
    </main>
  </div>
}

function AuthScreen(p) {
  return <div className="auth-wrap"><div className="auth-brand"><span className="brand-mark"><BookOpen size={22}/></span>Study<span className="gold">Deck</span></div><div className="auth-card"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>{p.authMode==='signup'?'Create your account':'Welcome back'}</h1><p className="muted">A calmer, smarter space for your learning journey.</p><form onSubmit={p.authenticate}>{p.authMode==='signup'&&<label>Full name<input value={p.fullName} onChange={e=>p.setFullName(e.target.value)} required placeholder="Your full name"/></label>}<label>Email address<input type="email" value={p.email} onChange={e=>p.setEmail(e.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" minLength="6" value={p.password} onChange={e=>p.setPassword(e.target.value)} required placeholder="At least 6 characters"/></label><button className="primary-btn" disabled={p.busy}>{p.busy?'Please wait…':p.authMode==='signup'?'Create account':'Sign in'}</button></form>{p.notice&&<div className="notice">{p.notice}</div>}<p className="switch-auth">{p.authMode==='signup'?'Already have an account?':'New to StudyDeck?'} <button onClick={()=>{p.setNotice('');p.setAuthMode(p.authMode==='signup'?'signin':'signup')}}>{p.authMode==='signup'?'Sign in':'Create an account'}</button></p></div><p className="auth-foot">Built for curious minds across Nigeria.</p></div>
}
