import { useState, useEffect, useRef } from 'react'
import './App.css'

const API      = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const API_MHS  = `${API}/mahasiswa`
const API_AUTH = `${API}/auth`

interface Mahasiswa { nim:string;nama:string;jurusan:string;email:string;ipk:number;status:string;semester?:number;angkatan?:number;tahunLulus?:number;kategori?:string }
interface User { id:string;username:string;email:string;role:string }

const KANJI = ['桜','学','道','知','花','美','心','空','風','水','月','夢','力','和']
const KANJI_ITEMS = KANJI.map(ch=>({
  ch, sz:Math.floor(Math.random()*65+38),
  left:Math.floor(Math.random()*90+2),
  top:Math.floor(Math.random()*85+2),
  dur:(Math.random()*6+4.5).toFixed(1),
  del:(Math.random()*4).toFixed(1)
}))
const PETALS = [
  {left:'3%',dur:'11s',del:'0s',size:15,hue:'rgba(240,180,195,.82)'},
  {left:'15%',dur:'14s',del:'3s',size:10,hue:'rgba(200,222,180,.72)'},
  {left:'29%',dur:'9s',del:'1.5s',size:17,hue:'rgba(240,178,192,.84)'},
  {left:'47%',dur:'12s',del:'4.5s',size:12,hue:'rgba(201,168,76,.58)'},
  {left:'63%',dur:'13s',del:'.7s',size:13,hue:'rgba(240,180,195,.77)'},
  {left:'78%',dur:'10s',del:'3.8s',size:9,hue:'rgba(200,222,180,.67)'},
  {left:'91%',dur:'15s',del:'2s',size:14,hue:'rgba(240,178,192,.74)'},
  {left:'38%',dur:'11s',del:'6.5s',size:11,hue:'rgba(240,190,200,.7)'},
  {left:'55%',dur:'13s',del:'8s',size:8,hue:'rgba(168,201,154,.62)'},
  {left:'22%',dur:'12s',del:'5s',size:9,hue:'rgba(201,168,76,.48)'},
]
const BAR_COLORS = ['bf-1','bf-2','bf-3','bf-4','bf-5','bf-6','bf-7','bf-8']

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({x:-9999,y:-9999})
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return
    const ctx = canvas.getContext('2d'); if(!ctx) return
    const COLORS = ['rgba(232,164,176,','rgba(168,201,154,','rgba(201,168,76,','rgba(224,123,60,','rgba(200,195,185,']
    let W=0,H=0
    const particles: {x:number;y:number;r:number;vx:number;vy:number;alpha:number;color:string;pulse:number;pulseSpeed:number}[] = []
    function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
    resize(); window.addEventListener('resize',resize)
    for(let i=0;i<85;i++) particles.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*5+2,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,alpha:Math.random()*.35+.08,color:COLORS[Math.floor(Math.random()*COLORS.length)],pulse:Math.random()*Math.PI*2,pulseSpeed:Math.random()*.015+.005})
    let raf:number
    function tick(){
      const g=ctx.createLinearGradient(0,0,W,H)
      g.addColorStop(0,'#f2ebe0');g.addColorStop(.3,'#ede3d6');g.addColorStop(.68,'#deebd5');g.addColorStop(1,'#e8dfd2')
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H)
      for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<105){ctx.beginPath();ctx.strokeStyle=`rgba(196,99,122,${.065*(1-d/105)})`;ctx.lineWidth=.8;ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}}
      const mg=ctx.createRadialGradient(mouse.current.x,mouse.current.y,0,mouse.current.x,mouse.current.y,130)
      mg.addColorStop(0,'rgba(232,164,176,.08)');mg.addColorStop(1,'transparent')
      ctx.fillStyle=mg;ctx.fillRect(0,0,W,H)
      particles.forEach(p=>{
        const dx=p.x-mouse.current.x,dy=p.y-mouse.current.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<140){const f=(140-d)/140*.55;p.vx+=(dx/d)*f;p.vy+=(dy/d)*f}
        p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy
        if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20
        p.pulse+=p.pulseSpeed
        const pr=p.r+Math.sin(p.pulse)*1.2
        const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,pr*3.2)
        grd.addColorStop(0,p.color+p.alpha+')');grd.addColorStop(1,p.color+'0)')
        ctx.beginPath();ctx.arc(p.x,p.y,pr*3.2,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill()
        ctx.beginPath();ctx.arc(p.x,p.y,pr,0,Math.PI*2);ctx.fillStyle=p.color+(p.alpha*1.9).toFixed(2)+')';ctx.fill()
      })
      raf=requestAnimationFrame(tick)
    }
    tick()
    const mm=(e:MouseEvent)=>{mouse.current.x=e.clientX;mouse.current.y=e.clientY}
    window.addEventListener('mousemove',mm)
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',mm)}
  },[])
  return <canvas id="bgCanvas" ref={ref}/>
}

function PetalLayer() {
  return (
    <div className="petal-canvas">
      {PETALS.map((p,i)=>(
        <div key={i} className="petal" style={{left:p.left,animationDuration:`${p.dur},${parseFloat(p.dur)*.52}s`,animationDelay:`${p.del},${p.del}`}}>
          <svg width={p.size} height={p.size} viewBox="0 0 32 32" fill="none">
            <g transform="translate(16,16)">
              {[0,72,144,216,288].map(r=><ellipse key={r} cx="0" cy="-8" rx="5.5" ry="8.5" fill={p.hue} transform={`rotate(${r})`}/>)}
              <circle cx="0" cy="0" r="3" fill="rgba(255,220,120,.75)"/>
            </g>
          </svg>
        </div>
      ))}
    </div>
  )
}

function KanjiLayer() {
  return (
    <div className="kanji-layer">
      {KANJI_ITEMS.map((k,i)=>(
        <div key={i} className="kanji-char" style={{left:`${k.left}%`,top:`${k.top}%`,fontSize:`${k.sz}px`,animationDuration:`${k.dur}s`,animationDelay:`${k.del}s`}}>{k.ch}</div>
      ))}
    </div>
  )
}

function BrandIcon({size=20}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4 C14 7 10 8 8 11 C5.5 14.5 6 19.5 10 22 C12.5 23.5 15 23.5 17 22.5 C19 21.5 22.5 22.5 24.5 20 C27 17 26.5 12 24 9 C22 6.5 20 5.5 18 4.5 C17.2 4.1 16.5 4 16 4Z" fill="white" opacity="0.95"/>
      <circle cx="16" cy="14" r="2.5" fill="rgba(255,255,255,0.45)"/>
    </svg>
  )
}

function useCountUp(target:number, dec=false) {
  const [val,setVal] = useState(0)
  useEffect(()=>{
    const t=setTimeout(()=>{
      const s=performance.now(),dur=1300
      const f=(n:number)=>{const p=Math.min((n-s)/dur,1),e=1-Math.pow(1-p,3);setVal(dec?parseFloat((target*e).toFixed(2)):Math.round(target*e));if(p<1)requestAnimationFrame(f)}
      requestAnimationFrame(f)
    },350)
    return ()=>clearTimeout(t)
  },[target,dec])
  return val
}

type LoginView = 'login'|'register'|'register-otp'|'forgot'|'otp'|'reset'|'success'

function LoginPage({onLogin}:{onLogin:(t:string,u:User)=>void}) {
  const [view,setView]             = useState<LoginView>('login')
  const [anim,setAnim]             = useState<'in'|'back'>('in')
  const [username,setUsername]     = useState('')
  const [password,setPassword]     = useState('')
  const [showPass,setShowPass]     = useState(false)
  const [remember,setRemember]     = useState(false)
  const [email,setEmail]           = useState('')
  const [otp,setOtp]               = useState(['','','','','',''])
  const [newPass,setNewPass]       = useState('')
  const [confirmPass,setConfirm]   = useState('')
  const [loading,setLoading]       = useState(false)
  const [errors,setErrors]         = useState<Record<string,string>>({})
  const [shake,setShake]           = useState<string[]>([])
  const [otpTimer,setOtpTimer]     = useState(59)
  const [otpRunning,setOtpRunning] = useState(true)
  const [strength,setStrength]     = useState(0)
  const otpRefs  = useRef<HTMLInputElement[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const [regNama,setRegNama]               = useState('')
  const [regEmail,setRegEmail]             = useState('')
  const [regPass,setRegPass]               = useState('')
  const [regConfirm,setRegConfirm]         = useState('')
  const [regRole,setRegRole]               = useState<'admin'|'user'>('user')
  const [regOtp,setRegOtp]                 = useState(['','','','','',''])
  const [regShowPass,setRegShowPass]       = useState(false)
  const [regShowConfirm,setRegShowConfirm] = useState(false)
  const regOtpRefs = useRef<HTMLInputElement[]>([])

  const maskEmail=(e:string)=>{const[u,d]=e.split('@');return u?u.slice(0,2)+'***@'+(d||''):e}
  function goTo(v:LoginView,back=false){setAnim(back?'back':'in');setView(v);setErrors({})}
  function startTimer(){
    if(timerRef.current) clearInterval(timerRef.current)
    setOtpTimer(59);setOtpRunning(true)
    timerRef.current=setInterval(()=>setOtpTimer(s=>{if(s<=1){if(timerRef.current)clearInterval(timerRef.current);setOtpRunning(false);return 0}return s-1}),1000)
  }
  function doShake(f:string){setShake(s=>[...s,f]);setTimeout(()=>setShake(s=>s.filter(x=>x!==f)),400)}
  function checkStrength(v:string){let s=0;if(v.length>=8)s++;if(/[A-Z]/.test(v))s++;if(/[0-9]/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;setStrength(s)}
  const SC=['#d94f6a','#e07b3c','#c9a84c','#7a9e6e']
  const SL=['Lemah 😟','Cukup 🤔','Kuat 💪','Sangat Kuat 🛡️']

  async function handleLogin(){
    const e:Record<string,string>={}
    if(!username)e.username='NIM / Email tidak boleh kosong'
    if(!password)e.password='Kata sandi tidak boleh kosong'
    if(Object.keys(e).length){setErrors(e);Object.keys(e).forEach(k=>doShake(k));return}
    setLoading(true)
    try{
      const r=await fetch(`${API_AUTH}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
      const j=await r.json()
      if(!j.success)throw new Error(j.message)
      onLogin(j.token,j.user)
    }catch(err){setErrors({form:(err as Error).message});doShake('form')}
    finally{setLoading(false)}
  }

  async function handleForgot(){
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErrors({email:'Format email tidak valid'});doShake('email');return}
    setLoading(true)
    try{
      const r=await fetch(`${API_AUTH}/forgot-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
      const j=await r.json()
      if(!j.success)throw new Error(j.message)
      goTo('otp');setTimeout(()=>{otpRefs.current[0]?.focus();startTimer()},400)
    }catch(err){setErrors({email:(err as Error).message})}
    finally{setLoading(false)}
  }

  function handleOtpChange(i:number,v:string){
    const d=v.replace(/\D/g,'');const n=[...otp];n[i]=d;setOtp(n)
    if(d&&i<5)otpRefs.current[i+1]?.focus()
  }
  function handleOtpKey(i:number,e:React.KeyboardEvent){
    if(e.key==='Backspace'&&!otp[i]&&i>0){otpRefs.current[i-1]?.focus();const n=[...otp];n[i-1]='';setOtp(n)}
    if(e.key==='ArrowLeft'&&i>0)otpRefs.current[i-1]?.focus()
    if(e.key==='ArrowRight'&&i<5)otpRefs.current[i+1]?.focus()
  }
  function handleVerifyOtp(){
    if(otp.join('').length<6){doShake('otp');return}
    setLoading(true);setTimeout(()=>{setLoading(false);goTo('reset')},1200)
  }
  function handleReset(){
    if(!newPass||!confirmPass||newPass!==confirmPass){setErrors({confirm:'Kata sandi tidak cocok'});doShake('confirm');return}
    setLoading(true);setTimeout(()=>{setLoading(false);goTo('success')},1400)
  }

  async function handleRegister(){
    const e:Record<string,string>={}
    if(!regNama.trim())                                           e.regNama    ='Nama lengkap wajib diisi'
    if(!regEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) e.regEmail   ='Format email tidak valid'
    if(!regPass||regPass.length<8)                               e.regPass    ='Password minimal 8 karakter'
    if(regPass!==regConfirm)                                     e.regConfirm ='Kata sandi tidak cocok'
    if(Object.keys(e).length){setErrors(e);Object.keys(e).forEach(k=>doShake(k));return}
    setLoading(true)
    try{
      const r=await fetch(`${API_AUTH}/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nama:regNama,email:regEmail,password:regPass,role:regRole})})
      const j=await r.json()
      if(!j.success)throw new Error(j.message)
      goTo('register-otp');setTimeout(()=>{regOtpRefs.current[0]?.focus();startTimer()},400)
    }catch(err){setErrors({regForm:(err as Error).message});doShake('regForm')}
    finally{setLoading(false)}
  }

  async function handleVerifyRegisterOtp(){
    if(regOtp.join('').length<6){doShake('regOtp');return}
    setLoading(true)
    try{
      const r=await fetch(`${API_AUTH}/verify-register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:regEmail,otp:regOtp.join('')})})
      const j=await r.json()
      if(!j.success)throw new Error(j.message)
      onLogin(j.token,j.user)
    }catch(err){setErrors({regOtp:(err as Error).message});doShake('regOtp')}
    finally{setLoading(false)}
  }

  return (
    <div className="login-root">
      <ParticleCanvas/>
      <div className="orb-layer"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/><div className="orb orb-4"/></div>
      <KanjiLayer/><PetalLayer/>
      <div className="grain"/>
      <div className="card-scene">
        <div className="card">
          <div key={`${view}-${anim}`} className={anim==='in'?'view-slide':'view-back'}>

            {view==='login'&&<>
              <div className="brand">
                <div className="brand-icon"><BrandIcon/></div>
                <div><div className="brand-name">Zizaissance Akademik</div><div className="brand-sub">Portal Akademik Mahasiswa</div></div>
              </div>
              <div className="view-title">Selamat Datang 👋</div>
              <div className="view-subtitle">Masuk untuk melanjutkan ke sistem akademik</div>
              <div className="divider"/>
              {errors.form&&<div style={{background:'rgba(217,79,106,.08)',border:'1px solid rgba(217,79,106,.2)',borderRadius:'10px',padding:'10px 12px',marginBottom:'14px',fontSize:'12px',color:'#d94f6a'}}>{errors.form}</div>}
              <div className="field">
                <label className="field-label">NIM / Email</label>
                <div className={`input-wrap${shake.includes('username')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input className="field-input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="abcd@gmail.com" onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
                </div>
                {errors.username&&<div className="field-error">{errors.username}</div>}
              </div>
              <div className="field">
                <label className="field-label">Kata Sandi</label>
                <div className={`input-wrap${shake.includes('password')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input className="field-input has-eye" type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
                  <button className="eye-toggle" onClick={()=>setShowPass(!showPass)} type="button">
                    {showPass
                      ?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      :<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {errors.password&&<div className="field-error">{errors.password}</div>}
              </div>
              <div className="row-meta">
                <label className="remember" onClick={()=>setRemember(!remember)}>
                  <div className="check-box" style={remember?{background:'linear-gradient(135deg,#c4637a,#b85570)',borderColor:'transparent'}:{}}>
                    {remember&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="remember-label">Ingat saya</span>
                </label>
                <span className="forgot-link" onClick={()=>goTo('forgot')}>Lupa kata sandi?</span>
              </div>
              <button className="btn-primary" onClick={handleLogin} disabled={loading}>
                {loading?<><span className="btn-spinner"/>Memverifikasi...</>:'Masuk ke Dashboard'}
              </button>
              <div className="card-footer">
                <p className="footer-text">© 2026 Zizaissance's Sistem Akademik</p>
                <p style={{fontSize:'11px',color:'#b0a8a4',marginTop:'6px',textAlign:'center'}}>
                  Belum punya akun?{' '}
                  <span className="forgot-link" onClick={()=>goTo('register')}>Daftar sekarang</span>
                </p>
              </div>
            </>}

            {view==='register'&&<>
              <button className="back-btn" onClick={()=>goTo('login',true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Kembali
              </button>
              <div className="brand" style={{marginBottom:'16px'}}>
                <div className="brand-icon"><BrandIcon/></div>
                <div><div className="brand-name">Daftar Akun Baru</div><div className="brand-sub">Portal Akademik Mahasiswa</div></div>
              </div>
              <div className="view-subtitle" style={{marginBottom:'14px'}}>Isi data berikut untuk membuat akun</div>
              {errors.regForm&&<div style={{background:'rgba(217,79,106,.08)',border:'1px solid rgba(217,79,106,.2)',borderRadius:'10px',padding:'10px 12px',marginBottom:'14px',fontSize:'12px',color:'#d94f6a'}}>{errors.regForm}</div>}
              <div className="field">
                <label className="field-label">Nama Lengkap</label>
                <div className={`input-wrap${shake.includes('regNama')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input className="field-input" value={regNama} onChange={e=>setRegNama(e.target.value)} placeholder="Nama lengkap kamu" onKeyDown={e=>e.key==='Enter'&&handleRegister()}/>
                </div>
                {errors.regNama&&<div className="field-error">{errors.regNama}</div>}
              </div>
              <div className="field">
                <label className="field-label">Email</label>
                <div className={`input-wrap${shake.includes('regEmail')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input className="field-input" type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="abcd@gmail.com"/>
                </div>
                {errors.regEmail&&<div className="field-error">{errors.regEmail}</div>}
              </div>
              <div className="field">
                <label className="field-label">Kata Sandi</label>
                <div className={`input-wrap${shake.includes('regPass')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input className="field-input has-eye" type={regShowPass?'text':'password'} value={regPass} onChange={e=>{setRegPass(e.target.value);checkStrength(e.target.value)}} placeholder="Min. 8 karakter"/>
                  <button className="eye-toggle" onClick={()=>setRegShowPass(!regShowPass)} type="button">
                    {regShowPass
                      ?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      :<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                <div className="strength-bars">{[1,2,3,4].map(i=><div key={i} className="strength-bar" style={{background:i<=strength?SC[strength-1]:'rgba(232,164,176,.18)'}}/>)}</div>
                {strength>0&&<div style={{fontSize:'11px',color:SC[strength-1],marginTop:'4px'}}>{SL[strength-1]}</div>}
                {errors.regPass&&<div className="field-error">{errors.regPass}</div>}
              </div>
              <div className="field">
                <label className="field-label">Konfirmasi Kata Sandi</label>
                <div className={`input-wrap${shake.includes('regConfirm')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <input className="field-input has-eye" type={regShowConfirm?'text':'password'} value={regConfirm} onChange={e=>setRegConfirm(e.target.value)} placeholder="Ulangi kata sandi"/>
                  <button className="eye-toggle" onClick={()=>setRegShowConfirm(!regShowConfirm)} type="button">
                    {regShowConfirm
                      ?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      :<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {errors.regConfirm&&<div className="field-error">{errors.regConfirm}</div>}
              </div>
              <div className="field">
                <label className="field-label">Role Akun</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'4px'}}>
                  {(['user','admin'] as const).map(r=>(
                    <div key={r} onClick={()=>setRegRole(r)} style={{padding:'10px 12px',borderRadius:'10px',cursor:'pointer',transition:'all .2s',border:`1.5px solid ${regRole===r?'rgba(196,99,122,.5)':'rgba(232,164,176,.2)'}`,background:regRole===r?'rgba(196,99,122,.08)':'rgba(255,255,255,.3)',display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'14px',height:'14px',borderRadius:'50%',border:`2px solid ${regRole===r?'#c4637a':'rgba(196,99,122,.3)'}`,background:regRole===r?'#c4637a':'transparent',flexShrink:0,transition:'all .2s'}}/>
                      <div>
                        <div style={{fontSize:'12px',fontWeight:600,color:'#3d2a2a'}}>{r==='user'?'User':'Admin'}</div>
                        <div style={{fontSize:'10px',color:'#b0a8a4'}}>{r==='user'?'Akses terbatas':'Akses penuh'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn-primary" style={{marginTop:'4px'}} onClick={handleRegister} disabled={loading}>
                {loading?<><span className="btn-spinner"/>Mengirim OTP...</>:'Daftar & Kirim OTP'}
              </button>
              <div style={{textAlign:'center',marginTop:'12px',fontSize:'11px',color:'#b0a8a4'}}>
                Sudah punya akun?{' '}
                <span className="forgot-link" onClick={()=>goTo('login',true)}>Masuk sekarang</span>
              </div>
            </>}

            {view==='register-otp'&&<>
              <button className="back-btn" onClick={()=>goTo('register',true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Kembali
              </button>
              <div className="steps"><div className="step-dot done"/><div className="step-line"/><div className="step-dot active"/></div>
              <div className="view-title">Verifikasi Email 📬</div>
              <div className="view-subtitle" style={{marginBottom:'6px'}}>Kode OTP telah dikirim ke</div>
              <div className="email-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {maskEmail(regEmail)}
              </div>
              {errors.regOtp&&<div style={{background:'rgba(217,79,106,.08)',border:'1px solid rgba(217,79,106,.2)',borderRadius:'10px',padding:'10px 12px',margin:'10px 0',fontSize:'12px',color:'#d94f6a',textAlign:'center'}}>{errors.regOtp}</div>}
              <div className={`otp-row${shake.includes('regOtp')?' shake':''}`}>
                {regOtp.map((v,i)=>(
                  <input key={i} ref={el=>{if(el)regOtpRefs.current[i]=el}} className={`otp-box${v?' filled':''}`} type="text" maxLength={1} inputMode="numeric" value={v}
                    onChange={e=>{const d=e.target.value.replace(/\D/g,'');const n=[...regOtp];n[i]=d;setRegOtp(n);if(d&&i<5)regOtpRefs.current[i+1]?.focus()}}
                    onKeyDown={e=>{if(e.key==='Backspace'&&!regOtp[i]&&i>0){regOtpRefs.current[i-1]?.focus();const n=[...regOtp];n[i-1]='';setRegOtp(n)}if(e.key==='ArrowLeft'&&i>0)regOtpRefs.current[i-1]?.focus();if(e.key==='ArrowRight'&&i<5)regOtpRefs.current[i+1]?.focus()}}
                  />
                ))}
              </div>
              <div className="resend-row">
                <span className="resend-text">Tidak terima kode?</span>
                <button className="resend-btn" disabled={otpRunning} onClick={()=>{handleRegister();startTimer()}}>Kirim ulang</button>
                {otpRunning&&<span className="resend-timer">dalam {otpTimer} detik</span>}
              </div>
              <button className="btn-primary" style={{marginTop:'16px'}} onClick={handleVerifyRegisterOtp} disabled={loading}>
                {loading?<><span className="btn-spinner"/>Memverifikasi...</>:'Verifikasi & Masuk'}
              </button>
              <div style={{textAlign:'center',marginTop:'10px',fontSize:'10px',color:'#b0a8a4',lineHeight:1.5}}>
                Setelah verifikasi berhasil, kamu akan langsung masuk ke dashboard 🌸
              </div>
            </>}

            {view==='forgot'&&<>
              <button className="back-btn" onClick={()=>goTo('login',true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Kembali
              </button>
              <div className="steps"><div className="step-dot active"/><div className="step-line"/><div className="step-dot"/><div className="step-line"/><div className="step-dot"/></div>
              <div className="view-title">Lupa Kata Sandi?</div>
              <div className="view-subtitle">Masukkan email terdaftar untuk menerima kode verifikasi</div>
              <div className="divider"/>
              <div className="field">
                <label className="field-label">Email</label>
                <div className={`input-wrap${shake.includes('email')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="abcd@gmail.com" onKeyDown={e=>e.key==='Enter'&&handleForgot()}/>
                </div>
                {errors.email&&<div className="field-error">{errors.email}</div>}
              </div>
              <button className="btn-primary" onClick={handleForgot} disabled={loading}>
                {loading?<><span className="btn-spinner"/>Mengirim...</>:'Kirim Kode Verifikasi'}
              </button>
            </>}

            {view==='otp'&&<>
              <button className="back-btn" onClick={()=>goTo('forgot',true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Kembali
              </button>
              <div className="steps"><div className="step-dot done"/><div className="step-line"/><div className="step-dot active"/><div className="step-line"/><div className="step-dot"/></div>
              <div className="view-title">Kode Verifikasi</div>
              <div className="view-subtitle" style={{marginBottom:'6px'}}>Kode 6 digit telah dikirim ke</div>
              <div className="email-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {maskEmail(email)}
              </div>
              <div className={`otp-row${shake.includes('otp')?' shake':''}`}>
                {otp.map((v,i)=>(
                  <input key={i} ref={el=>{if(el)otpRefs.current[i]=el}} className={`otp-box${v?' filled':''}`} type="text" maxLength={1} inputMode="numeric" value={v}
                    onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)}/>
                ))}
              </div>
              <div className="resend-row">
                <span className="resend-text">Tidak terima kode?</span>
                <button className="resend-btn" disabled={otpRunning} onClick={startTimer}>Kirim ulang</button>
                {otpRunning&&<span className="resend-timer">dalam {otpTimer} detik</span>}
              </div>
              <button className="btn-primary" style={{marginTop:'16px'}} onClick={handleVerifyOtp} disabled={loading}>
                {loading?<><span className="btn-spinner"/>Memverifikasi...</>:'Verifikasi & Lanjutkan'}
              </button>
            </>}

            {view==='reset'&&<>
              <div className="steps"><div className="step-dot done"/><div className="step-line"/><div className="step-dot done"/><div className="step-line"/><div className="step-dot active"/></div>
              <div className="view-title">Buat Kata Sandi Baru</div>
              <div className="view-subtitle" style={{marginBottom:'4px'}}>Pilih kata sandi yang kuat dan belum pernah digunakan</div>
              <div className="divider"/>
              <div className="field">
                <label className="field-label">Kata Sandi Baru</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input className="field-input has-eye" type="password" value={newPass} onChange={e=>{setNewPass(e.target.value);checkStrength(e.target.value)}} placeholder="Min. 8 karakter"/>
                </div>
                <div className="strength-bars">{[1,2,3,4].map(i=><div key={i} className="strength-bar" style={{background:i<=strength?SC[strength-1]:'rgba(232,164,176,.18)'}}/>)}</div>
                {strength>0&&<div style={{fontSize:'11px',color:SC[strength-1],marginTop:'4px'}}>{SL[strength-1]}</div>}
              </div>
              <div className="field">
                <label className="field-label">Konfirmasi Kata Sandi</label>
                <div className={`input-wrap${shake.includes('confirm')?' shake':''}`}>
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <input className="field-input has-eye" type="password" value={confirmPass} onChange={e=>setConfirm(e.target.value)} placeholder="Ulangi kata sandi baru"/>
                </div>
                {errors.confirm&&<div className="field-error">{errors.confirm}</div>}
              </div>
              <button className="btn-primary" onClick={handleReset} disabled={loading}>
                {loading?<><span className="btn-spinner"/>Menyimpan...</>:'Simpan Kata Sandi Baru'}
              </button>
            </>}

            {view==='success'&&(
              <div style={{textAlign:'center',padding:'8px 0'}}>
                <div className="success-icon">
                  <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><polyline points="6,17 13,24 26,10" stroke="#7a9e6e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{fontFamily:"'Noto Serif JP',serif",fontSize:'21px',fontWeight:600,color:'var(--ink)',marginBottom:'7px'}}>Berhasil! 🌸</div>
                <div style={{fontSize:'13px',color:'var(--stone)',lineHeight:1.6,marginBottom:'22px',maxWidth:'270px',margin:'0 auto 22px'}}>Kata sandi kamu berhasil diperbarui.<br/>Silakan masuk dengan kata sandi baru.</div>
                <button className="btn-primary" onClick={()=>goTo('login')}>Masuk Sekarang</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────
function Dashboard({token,user,onLogout}:{token:string;user:User;onLogout:()=>void}) {
  const [data,setData]               = useState<Mahasiswa[]>([])
  const [loading,setLoading]         = useState(false)
  const [refreshing,setRefreshing]   = useState(false)
  const [activeNav,setActiveNav]     = useState(0)
  const [showForm,setShowForm]       = useState(false)
  const [editData,setEditData]       = useState<Mahasiswa|null>(null)
  const [stats,setStats]             = useState<Record<string,number>|null>(null)
  const [jurusanData,setJurusanData] = useState<Array<[string,string,number]>>([])
  const [form,setForm]               = useState({nim:'',nama:'',jurusan:'',email:'',ipk:'',status:'aktif',semester:'1',angkatan:'2024',tahunLulus:'2024'})

  // Table sort state
  const [tableData,setTableData]           = useState<Mahasiswa[]>([])
  const [tableSortKey,setTableSortKey]     = useState('')
  const [tableSortOrder,setTableSortOrder] = useState<'asc'|'desc'>('asc')

  // Pencarian state
  const [srQuery,setSrQuery]           = useState('')
  const [srAlg,setSrAlg]               = useState('linear')
  const [srResults,setSrResults]       = useState<Mahasiswa[]>([])
  const [srSteps,setSrSteps]           = useState<number|null>(null)
  const [srComplexity,setSrComplexity] = useState('')
  const [srLoading,setSrLoading]       = useState(false)

  // Sort state
  const [soKey,setSoKey]               = useState('nama')
  const [soAlg,setSoAlg]               = useState('bubble')
  const [soOrder,setSoOrder]           = useState('asc')
  const [soResults,setSoResults]       = useState<Mahasiswa[]>([])
  const [soSteps,setSoSteps]           = useState<number|null>(null)
  const [soComplexity,setSoComplexity] = useState('')
  const [soLoading,setSoLoading]       = useState(false)
  const [soTab,setSoTab]               = useState<'search'|'sort'>('search')
  const [showDevInfo,setShowDevInfo]   = useState(false)

  const srTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  const hdr = {'Content-Type':'application/json','Authorization':`Bearer ${token}`}
  const t1=useCountUp(stats?.total??0)
  const t2=useCountUp(stats?.aktif??0)
  const t3=useCountUp(stats?.lulus??0)
  const t4=useCountUp(stats?.rataIPK??0,true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{fetchData();fetchStats()},[])

  async function fetchData(){
    setLoading(true)
    try{
      const r=await fetch(API_MHS,{headers:hdr})
      const j=await r.json()
      setData(j.data??[])
      setTableData([])
      setSrResults([])
      setSrQuery('')
      setSrSteps(null)
      setSoResults([])
      setSoSteps(null)
    }finally{setLoading(false)}
  }

  async function fetchStats(){
    try{
      const r=await fetch(`${API_MHS}/stats`,{headers:hdr})
      const j=await r.json()
      setStats(j.data)
      if(j.data?.perJurusan){
        const entries=Object.entries(j.data.perJurusan) as Array<[string,number]>
        const mapped:Array<[string,string,number]>=entries.map(([name,pct],i)=>[name,BAR_COLORS[i%BAR_COLORS.length],pct])
        setJurusanData(mapped)
      }
    }catch(e){console.error(e)}
  }

  function handleTableSort(key:string){
  const newOrder = tableSortKey===key && tableSortOrder==='asc' ? 'desc' : 'asc'
  setTableSortKey(key)
  setTableSortOrder(newOrder)
  const sorted=[...data].sort((a,b)=>{
    const va=(a as unknown as Record<string,unknown>)[key]
    const vb=(b as unknown as Record<string,unknown>)[key]
    if(typeof va==='number'&&typeof vb==='number') return newOrder==='asc'?va-vb:vb-va
    return newOrder==='asc'?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va))
  })
  setTableData(sorted)
  }

  function handleSearchInput(val:string){
    setSrQuery(val)
    if(srTimerRef.current) clearTimeout(srTimerRef.current)
    if(!val.trim()){setSrResults([]);setSrSteps(null);setSrComplexity('');return}

    const trimmed = val.trim()
    let autoAlg = 'linear'
    if(/^\d{10}$/.test(trimmed)) autoAlg = 'binary'
    else if(trimmed.includes('@')) autoAlg = 'sequential'

    setSrAlg(autoAlg)
    srTimerRef.current=setTimeout(()=>doSearchAll(trimmed,autoAlg),400)
  }

  async function doSearchAll(q:string,alg:string){
    setSrLoading(true)
    try{
      if(alg==='binary'){
        const r=await fetch(`${API_MHS}/search?q=${encodeURIComponent(q)}&algorithm=binary&field=nim`,{headers:hdr})
        const j=await r.json()
        setSrResults(j.results??[])
        setSrSteps(j.steps??null)
        setSrComplexity(j.timeComplexity??'')
      } else if(alg==='sequential'){
        const r=await fetch(`${API_MHS}/search?q=${encodeURIComponent(q)}&algorithm=sequential`,{headers:hdr})
        const j=await r.json()
        setSrResults(j.results??[])
        setSrSteps(j.steps??null)
        setSrComplexity(j.timeComplexity??'')
      } else if(/^\d+$/.test(q)){
        const r=await fetch(`${API_MHS}/search?q=${encodeURIComponent(q)}&algorithm=linear&field=nim`,{headers:hdr})
        const j=await r.json()
        setSrResults(j.results??[])
        setSrSteps(j.steps??null)
        setSrComplexity(j.timeComplexity??'')
      } else {
        const [rNama,rJurusan]=await Promise.all([
          fetch(`${API_MHS}/search?q=${encodeURIComponent(q)}&algorithm=linear&field=nama`,{headers:hdr}).then(r=>r.json()),
          fetch(`${API_MHS}/search?q=${encodeURIComponent(q)}&algorithm=linear&field=jurusan`,{headers:hdr}).then(r=>r.json()),
        ])
        const allResults=[...(rNama.results??[]),...(rJurusan.results??[])]
        const seen=new Set<string>()
        const unique=allResults.filter(m=>{if(seen.has(m.nim))return false;seen.add(m.nim);return true})
        setSrResults(unique)
        setSrSteps((rNama.steps??0)+(rJurusan.steps??0))
        setSrComplexity('O(n)')
      }
    }finally{setSrLoading(false)}
  }

  async function doSort(){
    setSoLoading(true)
    try{
      const r=await fetch(`${API_MHS}/sort?key=${soKey}&algorithm=${soAlg}&order=${soOrder}`,{headers:hdr})
      const j=await r.json()
      setSoResults(j.sorted??[])
      setSoSteps(j.steps??null)
      setSoComplexity(j.timeComplexity??'')
    }finally{setSoLoading(false)}
  }

  async function handleSubmit(){
    const p={...form,ipk:parseFloat(form.ipk),semester:parseInt(form.semester),angkatan:parseInt(form.angkatan),tahunLulus:parseInt(form.tahunLulus)}
    try{
      if(editData)await fetch(`${API_MHS}/${editData.nim}`,{method:'PUT',headers:hdr,body:JSON.stringify(p)})
      else await fetch(API_MHS,{method:'POST',headers:hdr,body:JSON.stringify(p)})
      setShowForm(false);setEditData(null);resetForm();fetchData();fetchStats()
    }catch{alert('Gagal menyimpan')}
  }

  async function handleDelete(nim:string){
    if(!confirm(`Hapus NIM ${nim}?`))return
    await fetch(`${API_MHS}/${nim}`,{method:'DELETE',headers:hdr})
    fetchData();fetchStats()
  }

  async function handleExportCSV(){
    try{
      const r=await fetch(`${API_MHS}/export/csv`,{headers:hdr})
      if(!r.ok) throw new Error('Gagal export')
      const blob=await r.blob()
      const a=document.createElement('a')
      a.href=URL.createObjectURL(blob)
      a.download='mahasiswa.csv'
      a.click()
    }catch{alert('Gagal export CSV')}
  }

  function handleEdit(m:Mahasiswa){
    setEditData(m)
    setForm({nim:m.nim,nama:m.nama,jurusan:m.jurusan,email:m.email,ipk:String(m.ipk),status:m.status.toLowerCase(),semester:String(m.semester??1),angkatan:String(m.angkatan??2024),tahunLulus:String(m.tahunLulus??2024)})
    setShowForm(true)
  }
  function resetForm(){setForm({nim:'',nama:'',jurusan:'',email:'',ipk:'',status:'aktif',semester:'1',angkatan:'2024',tahunLulus:'2024'})}

  function highlightText(text:string,keyword:string){
    if(!keyword.trim()) return <>{text}</>
    const idx=text.toLowerCase().indexOf(keyword.toLowerCase())
    if(idx===-1) return <>{text}</>
    return <>{text.slice(0,idx)}<mark style={{background:'rgba(201,168,76,.3)',color:'#6a4e00',borderRadius:'2px',padding:'0 1px'}}>{text.slice(idx,idx+keyword.length)}</mark>{text.slice(idx+keyword.length)}</>
  }

  function sortIcon(col:string){
    if(tableSortKey!==col) return <span style={{opacity:.3,fontSize:'10px',marginLeft:'3px'}}>↕</span>
    return <span style={{fontSize:'10px',marginLeft:'3px',color:'#c4637a'}}>{tableSortOrder==='asc'?'↑':'↓'}</span>
  }

  const NAV_TIPS=['Dashboard','Data Mahasiswa','Pencarian','Statistik','Export','Pengaturan']
  const NAV_ICONS=[
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  ]

  const aktifPct=stats?Math.round((stats.aktif/Math.max(stats.total,1))*100):0
  const srDisplay=srQuery.trim()?srResults:data
  const soDisplay=soResults.length>0?soResults:data
  const tableDisplay=tableData.length>0?tableData:data

  return (
    <div className="full-dash">
      <PetalLayer/>
      <div className="dash-root">
        <div className="sidebar">
          <div className="sidebar-brand"><div className="brand-icon-sm"><BrandIcon size={18}/></div></div>
          <div className="nav-section">
            {NAV_ICONS.map((icon,i)=>(
              <div key={i} className={`nav-item${activeNav===i?' active':''}`} onClick={()=>setActiveNav(i)} title={NAV_TIPS[i]}>{icon}</div>
            ))}
            <div className="nav-divider"/>
          </div>
          <div className="sidebar-footer">
            <div className="icon-btn" style={{borderRadius:'10px'}} onClick={onLogout} title="Keluar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <div className="avatar" title={user.username}>{user.username[0].toUpperCase()}</div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-date">{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
              <div className="topbar-title">{NAV_TIPS[activeNav]}</div>
            </div>
            <div className="topbar-right">
              <button onClick={async()=>{setRefreshing(true);await Promise.all([fetchData(),fetchStats()]);setTimeout(()=>setRefreshing(false),500)}} disabled={refreshing} style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'20px',border:'none',background:'linear-gradient(135deg,#c4637a,#7a9e6e)',color:'#fff',fontSize:'12px',cursor:refreshing?'default':'pointer',fontWeight:600,boxShadow:'0 2px 8px rgba(196,99,122,.25)',opacity:refreshing?.7:1,transition:'opacity .2s'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:refreshing?'rotate(360deg)':'rotate(0deg)',transition:'transform .5s ease'}}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                {refreshing?'Memuat...':'Refresh'}
              </button>
              <div className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><div className="notif-dot"/></div>
            </div>
          </div>

          {/* ── DASHBOARD ── */}
          {activeNav===0&&<>
            <div className="banner">
              <div className="banner-shimmer"/>
              <div style={{position:'relative',zIndex:1}}>
                <div className="banner-label">🌸 Selamat datang kembali</div>
                <div className="banner-title">Halo, {user.username}!</div>
                <div className="banner-desc">Kelola data mahasiswa dengan mudah dan efisien.</div>
                <div className="banner-btns">
                  <button className="btn-banner" onClick={()=>{setActiveNav(1);setShowForm(true);resetForm()}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Mahasiswa
                  </button>
                  <button className="btn-gold" onClick={()=>setActiveNav(3)}>Lihat Statistik</button>
                </div>
              </div>
              <div className="banner-orb-wrap">
                <div className="orb-container">
                  <div className="orb-ring orb-ring-1"/><div className="orb-ring orb-ring-2"/><div className="orb-ring orb-ring-3"/>
                  <div className="orb-core">
                    <svg className="orb-arcs" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,.05)" strokeWidth="3"/>
                      <circle cx="50" cy="50" r="38" stroke="url(#ag1)" strokeWidth="3" strokeDasharray="120 119" strokeDashoffset="62" strokeLinecap="round"/>
                      <circle cx="50" cy="50" r="28" stroke="rgba(255,255,255,.05)" strokeWidth="3"/>
                      <circle cx="50" cy="50" r="28" stroke="url(#ag2)" strokeWidth="3" strokeDasharray="60 116" strokeDashoffset="35" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(255,200,215,.9)"/><stop offset="100%" stopColor="rgba(255,255,255,.6)"/></linearGradient>
                        <linearGradient id="ag2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(180,230,180,.85)"/><stop offset="100%" stopColor="rgba(255,255,255,.5)"/></linearGradient>
                      </defs>
                    </svg>
                    <div className="orb-center-text"><span className="orb-pct">{aktifPct}%</span><span className="orb-sublabel">Aktif</span></div>
                  </div>
                  <div className="orb-tag orb-tag-1"><span className="otag-dot" style={{background:'#f5aabe'}}/><span>IPK {t4}</span></div>
                  <div className="orb-tag orb-tag-2"><span className="otag-dot" style={{background:'#90d090'}}/><span>Aktif {aktifPct}%</span></div>
                  <div className="orb-tag orb-tag-3"><span className="otag-dot" style={{background:'#f0c84a'}}/><span>Lulus {t3}</span></div>
                </div>
              </div>
              <div className="banner-quick">
                <div className="bq-item"><span className="bq-num">{t1}</span><span className="bq-lbl">Total</span></div>
                <div className="bq-item"><span className="bq-num">{t2}</span><span className="bq-lbl">Aktif</span></div>
              </div>
            </div>

            <div className="stats-grid">
              {[
                {label:'Total Mahasiswa',num:t1,trend:`↑ ${t1} total`,cls:'trend-up',ic:'ic-sakura',sp:'0,25 10,22 20,18 30,20 40,12 55,8',sc:'#e8a4b0',icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>},
                {label:'Mahasiswa Aktif',num:t2,trend:`↑ ${aktifPct}% dari total`,cls:'trend-up',ic:'ic-matcha',sp:'0,28 10,24 20,20 30,22 40,14 55,10',sc:'#7a9e6e',icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>},
                {label:'Sudah Lulus',num:t3,trend:`★ ${stats?Math.round((stats.lulus/Math.max(stats.total,1))*100):0}% dari total`,cls:'trend-gold',ic:'ic-gold',sp:'0,20 10,18 20,15 30,16 40,10 55,7',sc:'#c9a84c',icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>},
                {label:'Rata-rata IPK',num:t4,trend:t4>=3.75?'★ Cumlaude':t4>=3.5?'★ Sangat Memuaskan':t4>=3.0?'★ Memuaskan':'★ Cukup',cls:'trend-up',ic:'ic-navy',sp:'0,22 10,20 20,18 30,17 40,15 55,13',sc:'#2c3e6b',icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>},
              ].map((s,i)=>(
                <div key={i} className="stat-card">
                  <svg className="stat-sparkline" viewBox="0 0 55 30"><polyline points={s.sp} fill="none" stroke={s.sc} strokeWidth="2"/></svg>
                  <div className="stat-head"><div className="stat-label">{s.label}</div><div className={`stat-icon ${s.ic}`}>{s.icon}</div></div>
                  <div className="stat-number">{s.num}</div>
                  <div className={`stat-trend ${s.cls}`}>{s.trend}</div>
                </div>
              ))}
            </div>

            <div className="bottom-grid">
              <div className="table-card">
                <div className="card-head">
                  <div className="card-title">Data Mahasiswa Terbaru</div>
                  <div className="card-link" onClick={()=>setActiveNav(1)}>Lihat semua ›</div>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Nama</th><th>Jurusan</th><th>IPK</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.length===0
                        ?<tr><td colSpan={4} style={{textAlign:'center',padding:'20px',color:'#b0a8a4',fontSize:'11px'}}>🌸 Belum ada data</td></tr>
                        :data.slice(0,6).map(m=>(
                          <tr key={m.nim}>
                            <td className="td-name">{m.nama}</td>
                            <td className="td-dept">{m.jurusan}</td>
                            <td><span className={`pill ${m.ipk>=3.75?'pill-ipk-top':m.ipk>=3.5?'pill-ipk-high':'pill-ipk-mid'}`}>{m.ipk}</span></td>
                            <td><span className={`pill ${m.status.toLowerCase()==='aktif'?'pill-active':'pill-lulus'}`}>{m.status.charAt(0).toUpperCase()+m.status.slice(1).toLowerCase()}</span></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dept-card">
                <div className="card-head" style={{padding:'11px 0 10px',borderBottom:'1px solid rgba(232,164,176,.12)'}}><div className="card-title">Per Jurusan</div></div>
                <div className="ring-chart" style={{margin:'10px 0 8px'}}>
                  <svg className="ring-svg" width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(232,164,176,.12)" strokeWidth="9"/>
                    {jurusanData.length>0?<>
                      {(()=>{
                        const total=175.9; let offset=21
                        return jurusanData.map(([,,pct],i)=>{
                          const dash=(pct/100)*total
                          const el=<circle key={i} cx="36" cy="36" r="28" fill="none" stroke={`url(#rg${i+1})`} strokeWidth="9" strokeDasharray={`${dash} ${total-dash}`} strokeDashoffset={-offset+21} strokeLinecap="round"/>
                          offset+=dash; return el
                        })
                      })()}
                    </>:<circle cx="36" cy="36" r="28" fill="none" stroke="rgba(232,164,176,.15)" strokeWidth="9"/>}
                    <defs>
                      <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e8a4b0"/><stop offset="100%" stopColor="#c4637a"/></linearGradient>
                      <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7a9e6e"/><stop offset="100%" stopColor="#4a6b3e"/></linearGradient>
                      <linearGradient id="rg3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#c9a84c"/><stop offset="100%" stopColor="#9a7228"/></linearGradient>
                      <linearGradient id="rg4" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8bb5c9"/><stop offset="100%" stopColor="#2c3e6b"/></linearGradient>
                      <linearGradient id="rg5" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#c9a4e8"/><stop offset="100%" stopColor="#7a4aa0"/></linearGradient>
                      <linearGradient id="rg6" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e8c4a4"/><stop offset="100%" stopColor="#c47a3e"/></linearGradient>
                      <linearGradient id="rg7" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a4e8c4"/><stop offset="100%" stopColor="#3e9a6e"/></linearGradient>
                      <linearGradient id="rg8" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e8a4a4"/><stop offset="100%" stopColor="#c43e3e"/></linearGradient>
                    </defs>
                    <text x="36" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e1a18" fontFamily="Plus Jakarta Sans">{stats?.total??0}</text>
                    <text x="36" y="44" textAnchor="middle" fontSize="7.5" fill="#7a7470" fontFamily="Plus Jakarta Sans">total</text>
                  </svg>
                </div>
                {jurusanData.length===0
                  ?<div style={{fontSize:'11px',color:'#b0a8a4',textAlign:'center',padding:'8px'}}>🌸 Belum ada data</div>
                  :jurusanData.map(([n,c,w],i)=>(
                    <div className="dept-item" key={i}>
                      <div className="dept-meta"><span className="dept-name">{n}</span><span className="dept-pct">{w}%</span></div>
                      <div className="bar-track"><div className={`bar-fill ${c}`} style={{width:`${w}%`}}/></div>
                    </div>
                  ))
                }
              </div>

              <div className="activity-card">
                <div className="card-head"><div className="card-title">Aktivitas Terkini</div></div>
                <div className="activity-list">
                  {data.length===0
                    ?<div className="activity-item">
                      <div className="act-dot act-d1"/>
                      <div><div className="act-text"><span>Belum ada aktivitas</span></div><div className="act-time">Tambah mahasiswa untuk memulai</div></div>
                    </div>
                    :[
                      {d:'act-d1',t:<><strong>{data[data.length-1]?.nama}</strong> ditambahkan</>,time:'Baru saja'},
                      {d:'act-d2',t:<><strong>{data[data.length-2]?.nama??'—'}</strong> <span>data tersimpan</span></>,time:'Sebelumnya'},
                      {d:'act-d3',t:<><strong>{t2} aktif</strong> <span>& {t3} lulus</span></>,time:'Status terkini'},
                      {d:'act-d4',t:<><strong>IPK rata-rata</strong> <span>{t4}</span></>,time:'Diperbarui'},
                      {d:'act-d1',t:<><strong>{t1} mahasiswa</strong> <span>terdaftar</span></>,time:'Total sistem'},
                    ].map((a,i)=>(
                      <div className="activity-item" key={i}>
                        <div className={`act-dot ${a.d}`}/>
                        <div><div className="act-text">{a.t}</div><div className="act-time">{a.time}</div></div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </>}

          {/* ── DATA MAHASISWA ── */}
          {activeNav===1&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:'10px',overflow:'hidden'}}>
              <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'12px 14px',backdropFilter:'blur(10px)',flexShrink:0,display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                <span style={{fontSize:'12px',color:'#7a7470',fontWeight:500}}>{data.length} mahasiswa terdaftar</span>
                {tableSortKey&&<span style={{fontSize:'11px',color:'#c4637a',background:'rgba(196,99,122,.08)',padding:'2px 8px',borderRadius:'20px'}}>diurutkan by {tableSortKey} {tableSortOrder==='asc'?'↑':'↓'}</span>}
                {tableSortKey&&<button onClick={()=>{setTableSortKey('');setTableData([])}} style={{fontSize:'10px',color:'#b0a8a4',background:'none',border:'none',cursor:'pointer'}}>✕ reset</button>}
                <div style={{flex:1}}/>
                <button onClick={()=>{setShowForm(true);setEditData(null);resetForm()}} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#c4637a,#a04560)',color:'#fff',fontSize:'11px',cursor:'pointer',fontWeight:600}}>+ Tambah Mahasiswa</button>
                <button onClick={handleExportCSV} style={{padding:'8px 14px',borderRadius:'8px',border:'1px solid rgba(122,158,110,.4)',background:'transparent',fontSize:'11px',color:'#4a6b3e',cursor:'pointer',textDecoration:'none',fontWeight:500}}>↓ Export CSV</button>
              </div>
              <div className="table-card" style={{flex:1}}>
                <div className="card-head"><div className="card-title">{data.length} mahasiswa</div></div>
                <div className="table-scroll">
                  {loading
                    ?<div style={{textAlign:'center',padding:'30px',color:'#b0a8a4',fontSize:'12px'}}>🌸 Memuat...</div>
                    :data.length===0
                    ?<div style={{textAlign:'center',padding:'30px',color:'#b0a8a4',fontSize:'12px'}}>🌸 Belum ada data</div>
                    :<table className="data-table">
                      <thead>
                        <tr>
                          <th onClick={()=>handleTableSort('nim')} style={{cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>NIM{sortIcon('nim')}</th>
                          <th onClick={()=>handleTableSort('nama')} style={{cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>Nama{sortIcon('nama')}</th>
                          <th onClick={()=>handleTableSort('jurusan')} style={{cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>Jurusan{sortIcon('jurusan')}</th>
                          <th>Email</th>
                          <th onClick={()=>handleTableSort('ipk')} style={{cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>IPK{sortIcon('ipk')}</th>
                          <th>Status</th><th>Kategori</th><th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableDisplay.map(m=>(
                          <tr key={m.nim}>
                            <td style={{fontFamily:'monospace',fontSize:'10px',color:'#c4637a'}}>{m.nim}</td>
                            <td className="td-name">{m.nama}</td>
                            <td className="td-dept">{m.jurusan}</td>
                            <td className="td-dept" style={{fontSize:'10px'}}>{m.email}</td>
                            <td><span className={`pill ${m.ipk>=3.75?'pill-ipk-top':m.ipk>=3.5?'pill-ipk-high':'pill-ipk-mid'}`}>{m.ipk}</span></td>
                            <td><span className={`pill ${m.status.toLowerCase()==='aktif'?'pill-active':'pill-lulus'}`}>{m.status.charAt(0).toUpperCase()+m.status.slice(1).toLowerCase()}</span></td>
                            <td className="td-dept" style={{fontSize:'10px'}}>{m.kategori??'-'}</td>
                            <td>
                              <div style={{display:'flex',gap:'6px'}}>
                                <button onClick={()=>handleEdit(m)} style={{background:'none',border:'1px solid rgba(232,164,176,.4)',borderRadius:'6px',padding:'3px 8px',fontSize:'10px',color:'#c4637a',cursor:'pointer'}}>Edit</button>
                                <button onClick={()=>handleDelete(m.nim)} style={{background:'none',border:'1px solid rgba(255,150,150,.4)',borderRadius:'6px',padding:'3px 8px',fontSize:'10px',color:'#c03030',cursor:'pointer'}}>Hapus</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── OTHER VIEWS ── */}
          {activeNav>1&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:'12px',overflow:'auto'}}>

              {/* ── PENCARIAN ── */}
              {activeNav===2&&(
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div style={{display:'flex',gap:'8px',background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'8px',backdropFilter:'blur(10px)'}}>
                    {(['search','sort'] as const).map(tab=>(
                      <button key={tab} onClick={()=>setSoTab(tab)} style={{flex:1,padding:'8px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:600,transition:'all .2s',background:soTab===tab?'linear-gradient(135deg,#c4637a,#7a9e6e)':'transparent',color:soTab===tab?'#fff':'#7a7470'}}>
                        {tab==='search'?'🔍 Pencarian':'⇅ Pengurutan'}
                      </button>
                    ))}
                  </div>

                  {soTab==='search'&&<>
                    <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'14px',backdropFilter:'blur(10px)'}}>
                      <div style={{position:'relative',marginBottom:'10px'}}>
                        <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none'}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input value={srQuery} onChange={e=>handleSearchInput(e.target.value)} placeholder="Cari nama, NIM, atau jurusan..." className="modal-input" style={{paddingLeft:'38px',paddingRight:srQuery?'36px':'12px',fontSize:'13px',width:'100%',height:'40px'}}/>
                        {srQuery&&<button onClick={()=>{setSrQuery('');setSrResults([]);setSrSteps(null)}} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#b0a8a4',fontSize:'18px',lineHeight:1}}>×</button>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'6px'}}>
                        <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                          {srLoading&&<span style={{fontSize:'11px',color:'#c4637a'}}>🌸 Mencari...</span>}
                          {!srLoading&&srQuery.trim()&&<span style={{fontSize:'11px',color:'#7a7470'}}><strong style={{color:'#c4637a'}}>{srResults.length}</strong> hasil untuk <strong>"{srQuery}"</strong></span>}
                          {!srLoading&&!srQuery.trim()&&<span style={{fontSize:'11px',color:'#b0a8a4'}}>{data.length} mahasiswa tersedia</span>}
                        </div>
                        <button onClick={()=>setShowDevInfo(v=>!v)} style={{display:'flex',alignItems:'center',gap:'4px',background:'none',border:'1px solid rgba(201,168,76,.35)',borderRadius:'20px',padding:'3px 10px',fontSize:'10px',color:'#9a7228',cursor:'pointer',fontWeight:500}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          {showDevInfo?'Sembunyikan info':'Info algoritma'}
                        </button>
                      </div>
                      {showDevInfo&&(
                        <div style={{marginTop:'10px',padding:'10px 12px',background:'rgba(201,168,76,.06)',borderRadius:'10px',border:'1px solid rgba(201,168,76,.2)'}}>
                          <div style={{fontSize:'10px',color:'#9a7228',fontWeight:600,marginBottom:'6px'}}>ℹ INFO ALGORITMA</div>
                          {srSteps!==null?(
                            <>
                              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'6px'}}>
                                <span style={{background:'rgba(122,158,110,.14)',color:'#4a6b3e',padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600}}>Steps: {srSteps}</span>
                                <span style={{background:'rgba(232,164,176,.2)',color:'#c4637a',padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600}}>{srComplexity}</span>
                                <span style={{background:'rgba(201,168,76,.15)',color:'#6a4e00',padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600}}>{srAlg==='binary'?'Binary Search':srAlg==='sequential'?'Sequential Search':'Linear Search'}</span>
                              </div>
                              <div style={{fontSize:'10px',color:'#7a7470'}}>
                                {srAlg==='binary'?'NIM lengkap (10 digit) terdeteksi → Binary Search O(log n). Data diurutkan lalu dicari dengan membagi dua array.':
                                 srAlg==='sequential'?'Email terdeteksi → Sequential Search O(n). Scan berurutan di nim, nama, jurusan, dan email tanpa filter field tertentu.':
                                 /^\d+$/.test(srQuery.trim())?'NIM parsial terdeteksi → Linear Search O(n) di field NIM.':
                                 'Teks terdeteksi → Linear Search O(n). Scan satu per satu di nama dan jurusan, hasil digabung.'}
                              </div>
                            </>
                          ):(
                            <div style={{fontSize:'10px',color:'#7a7470',lineHeight:1.7}}>
                              Sistem memilih algoritma otomatis:<br/>
                              • Ketik <strong>NIM lengkap (10 digit)</strong> → <strong>Binary Search O(log n)</strong><br/>
                              • Ketik <strong>NIM sebagian</strong> → <strong>Linear Search O(n)</strong> di field NIM<br/>
                              • Ketik <strong>nama/jurusan</strong> → <strong>Linear Search O(n)</strong> di nama + jurusan<br/>
                              • Ketik <strong>email</strong> → <strong>Sequential Search O(n)</strong><br/>
                              Ketik sesuatu untuk melihat steps aktual.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="table-card" style={{flex:1}}>
                      <div className="card-head">
                        <div className="card-title">{srQuery.trim()?`${srResults.length} hasil ditemukan`:`${data.length} mahasiswa`}</div>
                      </div>
                      <div className="table-scroll">
                        {srDisplay.length===0
                          ?<div style={{textAlign:'center',padding:'30px',color:'#b0a8a4',fontSize:'12px'}}>{srQuery.trim()?'🔍 Tidak ada hasil':'🌸 Belum ada data'}</div>
                          :<table className="data-table">
                            <thead><tr><th>NIM</th><th>Nama</th><th>Jurusan</th><th>IPK</th><th>Status</th><th>Kategori</th></tr></thead>
                            <tbody>
                              {srDisplay.map(m=>(
                                <tr key={m.nim}>
                                  <td style={{fontFamily:'monospace',fontSize:'10px',color:'#c4637a'}}>{highlightText(m.nim,srQuery)}</td>
                                  <td className="td-name">{highlightText(m.nama,srQuery)}</td>
                                  <td className="td-dept">{highlightText(m.jurusan,srQuery)}</td>
                                  <td><span className={`pill ${m.ipk>=3.75?'pill-ipk-top':m.ipk>=3.5?'pill-ipk-high':'pill-ipk-mid'}`}>{m.ipk}</span></td>
                                  <td><span className={`pill ${m.status.toLowerCase()==='aktif'?'pill-active':'pill-lulus'}`}>{m.status.charAt(0).toUpperCase()+m.status.slice(1).toLowerCase()}</span></td>
                                  <td className="td-dept" style={{fontSize:'10px'}}>{m.kategori??'-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        }
                      </div>
                    </div>
                  </>}

                  {soTab==='sort'&&<>
                    <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'14px',backdropFilter:'blur(10px)'}}>
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                        <select value={soKey} onChange={e=>setSoKey(e.target.value)} className="modal-input" style={{width:'auto',fontSize:'11px'}}>
                          <option value="nama">Urutkan: Nama</option>
                          <option value="nim">Urutkan: NIM</option>
                          <option value="ipk">Urutkan: IPK</option>
                        </select>
                        <select value={soOrder} onChange={e=>setSoOrder(e.target.value)} className="modal-input" style={{width:'auto',fontSize:'11px'}}>
                          <option value="asc">A → Z / Kecil → Besar</option>
                          <option value="desc">Z → A / Besar → Kecil</option>
                        </select>
                        <button onClick={doSort} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#c4637a,#7a9e6e)',color:'#fff',fontSize:'11px',cursor:'pointer',fontWeight:600}}>
                          {soLoading?'Mengurutkan...':'Urutkan Data'}
                        </button>
                        {soResults.length>0&&<button onClick={()=>{setSoResults([]);setSoSteps(null)}} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid rgba(232,164,176,.4)',background:'transparent',fontSize:'11px',color:'#c4637a',cursor:'pointer'}}>Reset</button>}
                        <button onClick={()=>setShowDevInfo(v=>!v)} style={{display:'flex',alignItems:'center',gap:'4px',background:'none',border:'1px solid rgba(201,168,76,.35)',borderRadius:'20px',padding:'3px 10px',fontSize:'10px',color:'#9a7228',cursor:'pointer',fontWeight:500,marginLeft:'auto'}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          {showDevInfo?'Sembunyikan info':'Info algoritma'}
                        </button>
                      </div>
                      {showDevInfo&&(
                        <div style={{marginTop:'10px',padding:'10px 12px',background:'rgba(201,168,76,.06)',borderRadius:'10px',border:'1px solid rgba(201,168,76,.2)'}}>
                          <div style={{fontSize:'10px',color:'#9a7228',fontWeight:600,marginBottom:'6px'}}>ℹ INFO ALGORITMA</div>
                          {soSteps!==null&&(
                            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'8px'}}>
                              <span style={{background:'rgba(122,158,110,.14)',color:'#4a6b3e',padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600}}>Steps: {soSteps}</span>
                              <span style={{background:'rgba(232,164,176,.2)',color:'#c4637a',padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600}}>{soComplexity}</span>
                            </div>
                          )}
                          <div style={{fontSize:'10px',color:'#7a7470',lineHeight:1.6,marginBottom:'8px'}}>
                            {soAlg==='bubble'&&'Bubble Sort O(n²) — bandingkan elemen berdekatan, tukar jika salah urutan.'}
                            {soAlg==='selection'&&'Selection Sort O(n²) — cari minimum tiap iterasi, taruh di depan.'}
                            {soAlg==='insertion'&&'Insertion Sort O(n²) worst / O(n) best — sisipkan ke posisi tepat.'}
                            {soAlg==='merge'&&'Merge Sort O(n log n) — divide and conquer, stabil untuk data besar.'}
                            {soAlg==='shell'&&'Shell Sort O(n log² n) — variasi insertion dengan gap mengecil.'}
                          </div>
                          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                            {[{v:'bubble',l:'Bubble'},{v:'selection',l:'Selection'},{v:'insertion',l:'Insertion'},{v:'merge',l:'Merge'},{v:'shell',l:'Shell'}].map(a=>(
                              <button key={a.v} onClick={()=>setSoAlg(a.v)} style={{padding:'3px 10px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'10px',fontWeight:500,background:soAlg===a.v?'linear-gradient(135deg,#c4637a,#7a9e6e)':'rgba(200,195,185,.2)',color:soAlg===a.v?'#fff':'#7a7470',transition:'all .2s'}}>
                                {a.l}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="table-card" style={{flex:1}}>
                      <div className="card-head">
                        <div className="card-title">{soResults.length>0?`${soResults.length} mahasiswa — diurutkan by ${soKey} (${soOrder==='asc'?'A→Z':'Z→A'})`:`${data.length} mahasiswa`}</div>
                      </div>
                      <div className="table-scroll">
                        {soDisplay.length===0
                          ?<div style={{textAlign:'center',padding:'30px',color:'#b0a8a4',fontSize:'12px'}}>🌸 Belum ada data</div>
                          :<table className="data-table">
                            <thead><tr><th>#</th><th>NIM</th><th>Nama</th><th>Jurusan</th><th>IPK</th><th>Status</th></tr></thead>
                            <tbody>
                              {soDisplay.map((m,i)=>(
                                <tr key={m.nim}>
                                  <td style={{fontSize:'10px',color:'#b0a8a4',width:'30px'}}>{i+1}</td>
                                  <td style={{fontFamily:'monospace',fontSize:'10px',color:'#c4637a'}}>{m.nim}</td>
                                  <td className="td-name">{m.nama}</td>
                                  <td className="td-dept">{m.jurusan}</td>
                                  <td><span className={`pill ${m.ipk>=3.75?'pill-ipk-top':m.ipk>=3.5?'pill-ipk-high':'pill-ipk-mid'}`}>{m.ipk}</span></td>
                                  <td><span className={`pill ${m.status.toLowerCase()==='aktif'?'pill-active':'pill-lulus'}`}>{m.status.charAt(0).toUpperCase()+m.status.slice(1).toLowerCase()}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        }
                      </div>
                    </div>
                  </>}
                </div>
              )}

              {activeNav===3&&(
                <div className="responsive-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'16px',backdropFilter:'blur(10px)'}}>
                    <div className="card-title" style={{marginBottom:'14px'}}>Ringkasan Statistik</div>
                    {[
                      {label:'Total Mahasiswa',value:t1,color:'#c4637a'},
                      {label:'Mahasiswa Aktif',value:t2,color:'#7a9e6e'},
                      {label:'Sudah Lulus',value:t3,color:'#c9a84c'},
                      {label:'Rata-rata IPK',value:t4,color:'#2c3e6b'},
                    ].map((s,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(232,164,176,.1)'}}>
                        <span style={{fontSize:'12px',color:'#7a7470'}}>{s.label}</span>
                        <span style={{fontSize:'16px',fontWeight:700,color:s.color}}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'16px',backdropFilter:'blur(10px)'}}>
                    <div className="card-title" style={{marginBottom:'14px'}}>Distribusi Per Jurusan</div>
                    {jurusanData.map(([n,c,w],i)=>(
                      <div key={i} style={{marginBottom:'12px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                          <span style={{fontSize:'12px',color:'#1e1a18',fontWeight:500}}>{n}</span>
                          <span style={{fontSize:'12px',color:'#7a7470',fontWeight:600}}>{w}%</span>
                        </div>
                        <div className="bar-track" style={{height:'8px'}}><div className={`bar-fill ${c}`} style={{width:`${w}%`,height:'8px'}}/></div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'16px',backdropFilter:'blur(10px)',gridColumn:'1/-1'}}>
                    <div className="card-title" style={{marginBottom:'14px'}}>Distribusi Kategori IPK</div>
                    <div className="responsive-grid-4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
                      {[
                        {label:'Cumlaude',desc:'IPK ≥ 3.75',count:data.filter(m=>m.ipk>=3.75).length,color:'#c4637a'},
                        {label:'Sangat Memuaskan',desc:'IPK 3.50–3.74',count:data.filter(m=>m.ipk>=3.5&&m.ipk<3.75).length,color:'#7a9e6e'},
                        {label:'Memuaskan',desc:'IPK 3.00–3.49',count:data.filter(m=>m.ipk>=3.0&&m.ipk<3.5).length,color:'#c9a84c'},
                        {label:'Cukup',desc:'IPK < 3.00',count:data.filter(m=>m.ipk<3.0).length,color:'#2c3e6b'},
                      ].map((k,i)=>(
                        <div key={i} style={{background:`rgba(${i===0?'196,99,122':i===1?'122,158,110':i===2?'201,168,76':'44,62,107'},.08)`,borderRadius:'12px',padding:'14px',textAlign:'center',border:`1px solid rgba(${i===0?'196,99,122':i===1?'122,158,110':i===2?'201,168,76':'44,62,107'},.15)`}}>
                          <div style={{fontSize:'24px',fontWeight:700,color:k.color}}>{k.count}</div>
                          <div style={{fontSize:'11px',fontWeight:600,color:k.color,marginTop:'4px'}}>{k.label}</div>
                          <div style={{fontSize:'10px',color:'#b0a8a4',marginTop:'2px'}}>{k.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeNav===4&&(
                <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'20px',backdropFilter:'blur(10px)'}}>
                  <div className="card-title" style={{marginBottom:'16px'}}>Export Data</div>
                  <div className="responsive-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                    <a onClick={handleExportCSV} style={{display:'flex',alignItems:'center',gap:'12px',background:'rgba(122,158,110,.08)',border:'1px solid rgba(122,158,110,.2)',borderRadius:'12px',padding:'16px',textDecoration:'none',cursor:'pointer',transition:'all .2s'}}
                      onMouseOver={e=>(e.currentTarget.style.background='rgba(122,158,110,.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(122,158,110,.08)')}>
                      <div style={{width:'40px',height:'40px',background:'linear-gradient(135deg,#7a9e6e,#4a6b3e)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                      <div><div style={{fontSize:'13px',fontWeight:600,color:'#1e1a18'}}>Export CSV</div><div style={{fontSize:'11px',color:'#7a7470',marginTop:'2px'}}>Download semua data dalam format CSV</div></div>
                    </a>
                    <a href={`${API_MHS}`} onClick={async(e)=>{e.preventDefault();const r=await fetch(API_MHS,{headers:hdr});const j=await r.json();const blob=new Blob([JSON.stringify(j.data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mahasiswa.json';a.click()}}
                      style={{display:'flex',alignItems:'center',gap:'12px',background:'rgba(44,62,107,.08)',border:'1px solid rgba(44,62,107,.2)',borderRadius:'12px',padding:'16px',textDecoration:'none',cursor:'pointer',transition:'all .2s'}}
                      onMouseOver={e=>(e.currentTarget.style.background='rgba(44,62,107,.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(44,62,107,.08)')}>
                      <div style={{width:'40px',height:'40px',background:'linear-gradient(135deg,#2c3e6b,#1a2545)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div><div style={{fontSize:'13px',fontWeight:600,color:'#1e1a18'}}>Export JSON</div><div style={{fontSize:'11px',color:'#7a7470',marginTop:'2px'}}>Download semua data dalam format JSON</div></div>
                    </a>
                  </div>
                  <div style={{marginTop:'16px',padding:'12px',background:'rgba(232,164,176,.08)',borderRadius:'10px',border:'1px solid rgba(232,164,176,.2)'}}>
                    <p style={{fontSize:'11px',color:'#7a7470',margin:0}}>ℹ Total <strong style={{color:'#c4637a'}}>{t1} mahasiswa</strong> siap diexport • Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              )}

              {activeNav===5&&(
                <div style={{background:'rgba(255,255,255,.65)',borderRadius:'14px',border:'1px solid rgba(232,164,176,.15)',padding:'20px',backdropFilter:'blur(10px)'}}>
                  <div className="card-title" style={{marginBottom:'16px'}}>Pengaturan Akun</div>
                  <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px',background:'rgba(232,164,176,.06)',borderRadius:'12px',marginBottom:'16px'}}>
                    <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'linear-gradient(135deg,#c4637a,#7a9e6e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:700,color:'white'}}>{user.username[0].toUpperCase()}</div>
                    <div><div style={{fontSize:'14px',fontWeight:600,color:'#1e1a18'}}>{user.username}</div><div style={{fontSize:'11px',color:'#7a7470',marginTop:'2px'}}>{user.role} • {user.email}</div></div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {[{label:'Username',value:user.username},{label:'Email',value:user.email},{label:'Role',value:user.role},{label:'Status',value:'Aktif ✓'}].map((f,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'rgba(255,255,255,.5)',borderRadius:'10px',border:'1px solid rgba(232,164,176,.12)'}}>
                        <span style={{fontSize:'12px',color:'#7a7470',fontWeight:500}}>{f.label}</span>
                        <span style={{fontSize:'12px',color:'#1e1a18',fontWeight:600}}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={onLogout} style={{marginTop:'16px',width:'100%',padding:'11px',borderRadius:'10px',border:'1px solid rgba(196,99,122,.3)',background:'transparent',fontSize:'13px',color:'#c4637a',cursor:'pointer',fontWeight:600}}>Keluar dari Akun</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm&&(
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{fontSize:'15px',fontWeight:600,color:'#3d2a2a',fontFamily:"'Noto Serif JP',serif"}}>{editData?'✏️ Edit Mahasiswa':'🌸 Tambah Mahasiswa'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',fontSize:'18px',color:'#b0a8a4',cursor:'pointer'}}>×</button>
            </div>
            <div className="responsive-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {[{k:'nim',l:'NIM',p:'1234567890',d:!!editData},{k:'nama',l:'Nama',p:'Nama Lengkap'},{k:'jurusan',l:'Jurusan',p:'Teknik Informatika'},{k:'ipk',l:'IPK',p:'3.75'}].map(f=>(
                <div key={f.k}><label className="modal-label">{f.l}</label><input className="modal-input" value={(form as Record<string,string>)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} disabled={f.d} style={{opacity:f.d?.6:1}}/></div>
              ))}
              <div style={{gridColumn:'1/-1'}}><label className="modal-label">Email</label><input className="modal-input" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="abcd@gmail.com"/></div>
              <div><label className="modal-label">Status</label><select className="modal-input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="aktif">Aktif</option><option value="lulus">Lulus</option></select></div>
              {form.status==='aktif'?<>
                <div><label className="modal-label">Semester</label><input className="modal-input" value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))}/></div>
                <div><label className="modal-label">Angkatan</label><input className="modal-input" value={form.angkatan} onChange={e=>setForm(p=>({...p,angkatan:e.target.value}))}/></div>
              </>:<div><label className="modal-label">Tahun Lulus</label><input className="modal-input" value={form.tahunLulus} onChange={e=>setForm(p=>({...p,tahunLulus:e.target.value}))}/></div>}
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
              <button onClick={handleSubmit} style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#c4637a,#a04560)',color:'#fff',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>{editData?'Simpan Perubahan':'Tambah Mahasiswa'}</button>
              <button onClick={()=>setShowForm(false)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid rgba(232,164,176,.4)',background:'transparent',fontSize:'13px',color:'#c4637a',cursor:'pointer'}}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [token,setToken] = useState<string|null>(()=>localStorage.getItem('token'))
  const [user,setUser]   = useState<User|null>(()=>{const u=localStorage.getItem('user');return u?JSON.parse(u):null})
  function handleLogin(t:string,u:User){localStorage.setItem('token',t);localStorage.setItem('user',JSON.stringify(u));setToken(t);setUser(u)}
  function handleLogout(){localStorage.removeItem('token');localStorage.removeItem('user');setToken(null);setUser(null)}
  if(!token||!user)return <LoginPage onLogin={handleLogin}/>
  return <Dashboard token={token} user={user} onLogout={handleLogout}/>
}