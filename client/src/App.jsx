import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS — CHARTE GRAPHIQUE BCEG OFFICIELLE
// Page 19 : #4D553D (RVB 77,85,61) | #A6AA9E | #FFFFFF
// ═══════════════════════════════════════════════════════════
const G1    = "#3A4130";   // Vert olive foncé
const G2    = "#4D553D";   // Vert olive primaire (brand color officiel)
const G3    = "#5E6B4D";   // Vert olive clair
const GRAY  = "#A6AA9E";   // Gris chaud (page 19)
const WHITE = "#FFFFFF";
const BG    = "#F5F3EF";   // Fond blanc cassé chaud
const T_D   = "#2A2E24";   // Texte sombre
const T_M   = "#5C6350";   // Texte moyen
const T_L   = "#9AA395";   // Texte léger
const BORDER = "#DDD9D0";
const RED    = "#C0392B";

// ═══════════════════════════════════════════════════════════
// DONNÉES MÉTIER
// ═══════════════════════════════════════════════════════════
const AGENCES = [
  "Agence Okoumé (Siège)", "Agence Movingui", "Agence Bilinga",
  "Point Cash Tali", "Point Cash Akanda",
  "Bureau Ozigo (Port-Gentil)", "Agence Azobé"
];

const POLES = [
  { id: "comptabilite", label: "Comptabilité", icon: "📊",
    items: [
      { id: "contestation_agios",         label: "Contestation d'agios",             extras: ["montant"] },
      { id: "contestation_date_valeur",   label: "Contestation de date de valeur",   extras: [] },
      { id: "interets_non_credits",       label: "Intérêts non crédités",            extras: ["montant"] },
      { id: "interets_mal_calcules",      label: "Intérêts mal calculés",            extras: ["montant"] },
      { id: "contestation_frais_forcage", label: "Contestation frais de forçage",    extras: ["montant"] },
    ]
  },
  { id: "engagement", label: "Engagement", icon: "📋",
    items: [
      { id: "mainlevee_caution",           label: "Main levée sur caution douanière",         extras: [] },
      { id: "contestation_frais_dossier",  label: "Contestation des frais de dossier",        extras: ["montant"] },
      { id: "decouvert_non_parametrage",   label: "Découvert non paramétré",                  extras: [] },
      { id: "contestation_echeance",       label: "Contestation échéance crédit",             extras: ["montant"] },
      { id: "conditions_non_parametrees",  label: "Conditions particulières non paramétrées", extras: [] },
    ]
  },
  { id: "digital", label: "Digital", icon: "📱",
    items: [
      { id: "remb_retrait_sc",       label: "Remboursement retrait sans carte infructueux",               extras: ["montant"] },
      { id: "ajustement_solde_cvp",  label: "Ajustement solde CVP",                                       extras: ["montant"] },
      { id: "analyse_mvt_cvp",       label: "Analyse des mouvements CVP",                                 extras: [] },
      { id: "recharge_cvp_nc",       label: "Rechargement CVP non crédité",                               extras: ["montant"] },
      { id: "recharge_cv_infr",      label: "Rechargement compte virtuel infructueux",                    extras: ["montant"] },
      { id: "virement_cv_infr",      label: "Virement compte virtuel infructueux",                        extras: ["montant"] },
      { id: "edan_infr",             label: "Achat Unité EDAN infructueux / Code EDAN non reçu",          extras: ["montant"] },
      { id: "achat_tel_infr",        label: "Achat Unités téléphoniques infructueux",                     extras: ["montant"] },
      { id: "retrait_sc_gab_bfi",    label: "Retrait sans carte GAB BFI infructueux et comptabilisé",     extras: ["montant"] },
      { id: "recharge_cvp_infr",     label: "Rechargement CVP infructueux",                               extras: ["montant"] },
      { id: "gimac_ww_digital",      label: "Transfert GIMAC wallet to wallet infructueux (time out/pending)", extras: ["montant"] },
    ]
  },
  { id: "informatique", label: "Informatique", icon: "💻",
    items: [
      { id: "parametrage_comptes",    label: "Paramétrage comptes (courant/épargne) sur BGFIMobile",               extras: [] },
      { id: "compte_mobile_invisible",label: "Compte BGFIMobile non visible",                                      extras: [] },
      { id: "virement_mobile_np",     label: "Virement autre banque via BGFIMobile non parvenu au bénéficiaire",  extras: ["montant"] },
      { id: "avis_operation_info",    label: "Demande d'avis d'opération",                                        extras: [] },
      { id: "extrait_non_parvenu",    label: "Extrait de compte non parvenu",                                     extras: [] },
    ]
  },
  { id: "monetique", label: "Monétique", icon: "💳",
    items: [
      { id: "code_retrait_illisible",  label: "Code de retrait sans carte illisible ou non disponible",              extras: [] },
      { id: "paiement_internet_visa",  label: "Paiement internet VISA infructueux / Achat en ligne GIMAC infructueux", extras: ["montant"] },
      { id: "paiement_tpe_visa",       label: "Paiement TPE VISA infructueux / Achat TPE GIMAC infructueux",          extras: ["montant"] },
      { id: "retrait_gab_bgfi_mon",    label: "Retrait GAB BGFI infructueux",                                        extras: ["montant"] },
      { id: "demande_images",          label: "Demande d'images",                                                    extras: [] },
      { id: "remb_paiement_internet",  label: "Remboursement d'un paiement internet non effectif en carte",          extras: ["montant"] },
      { id: "paiements_non_reconnus",  label: "Paiements non reconnus",                                             extras: [] },
      { id: "contest_solde_cvp",       label: "Contestation solde CVP",                                             extras: ["montant"] },
      { id: "contest_reponse_retrait", label: "Contestation de réponse sur un retrait non reçu",                    extras: ["montant"] },
      { id: "retrait_gab_visa",        label: "Retrait GAB VISA infructueux",                                       extras: ["montant"] },
      { id: "retrait_gab_gimac",       label: "Retrait GAB GIMAC infructueux",                                      extras: ["montant"] },
      { id: "gimac_ww_mon",            label: "Transfert GIMAC wallet to wallet infructueux",                       extras: ["montant"] },
      { id: "tpe_bgfi_salaire",        label: "CARTE SALAIRE — Paiement TPE BGFI infructueux",                      extras: ["montant"] },
      { id: "retrait_bgfi_salaire",    label: "CARTE SALAIRE — Retrait GAB BGFI infructueux et comptabilisé",       extras: ["montant"] },
      { id: "contest_solde_carte",     label: "Contestation de solde disponible en carte",                          extras: ["montant"] },
    ]
  },
  { id: "operations", label: "Opérations", icon: "🔄",
    items: [
      { id: "virement_intra_inter",   label: "Virement intra/inter non parvenu au bénéficiaire",  extras: ["montant"] },
      { id: "remise_cheque",          label: "Remise chèque non créditée",                        extras: ["montant"] },
      { id: "opposition_cheque",      label: "Opposition chèque non traitée",                     extras: [] },
      { id: "paiement_cheque_nr",     label: "Paiement chèque non reconnu",                       extras: ["montant"] },
      { id: "contest_frais_op",       label: "Contestation de frais",                             extras: ["montant"] },
      { id: "contest_interet_dat",    label: "Contestation intérêt sur DAT",                      extras: ["montant"] },
      { id: "avis_operation",         label: "Demande d'avis d'opération",                        extras: [] },
      { id: "versement_guichet",      label: "Versement au guichet non crédité",                  extras: ["montant"] },
      { id: "operation_non_reconnue", label: "Opération non reconnue",                            extras: ["montant"] },
      { id: "opposition_carte",       label: "Opposition carte non traitée dans les délais",      extras: [] },
      { id: "operation_mal_exec",     label: "Opération mal exécutée",                            extras: ["montant"] },
      { id: "operation_double",       label: "Opération débitée en double",                       extras: ["montant"] },
    ]
  },
  { id: "operations_inter", label: "Opérations Internationales", icon: "🌍",
    items: [
      { id: "virement_trf_np",       label: "Virement/TRF non parvenu au bénéficiaire",                      extras: ["montant"] },
      { id: "op_mal_exec_inter",     label: "Opération mal exécutée",                                        extras: ["montant"] },
      { id: "rapatriement_nr",       label: "Rapatriement/RPT non reçu / contestation des frais corresp.",   extras: ["montant"] },
      { id: "contest_taux_devise",   label: "Contestation du taux de devise",                                extras: [] },
      { id: "sort_virement_emis",    label: "Demande de sort de virement/TRF émis",                          extras: [] },
    ]
  },
  { id: "recouvrement", label: "Recouvrement et Juridique", icon: "⚖️",
    items: [
      { id: "attestation_endet",  label: "Attestation d'endettement",       extras: [] },
      { id: "attestation_fin_cr", label: "Attestation de fin de crédit",    extras: [] },
      { id: "trop_percu_jur",     label: "Trop-perçu (contentieux)",        extras: ["montant"] },
      { id: "mainlevee_garantie", label: "Mainlevée / Déblocage garantie",  extras: ["upload_lettre"] },
    ]
  },
  { id: "commercial", label: "Commercial", icon: "🤝",
    items: [
      { id: "cloture_compte",       label: "Clôture de compte",                                extras: [] },
      { id: "changement_gest",      label: "Changement de gestionnaire",                       extras: [] },
      { id: "duree_traitement",     label: "Durée de traitement de dossier",                   extras: [] },
      { id: "agios_trop_percu",     label: "Agios / Trop-perçu",                               extras: ["montant", "upload_releve"] },
    ]
  },
  { id: "achats_logistique", label: "Achats et Logistique", icon: "📦",
    items: [
      { id: "facture_impayee",  label: "Facture impayée",  extras: ["montant", "upload_facture"] },
    ]
  },
];

const PROFILES = [
  { id: "particulier",       label: "Particulier",         icon: "👤", desc: "Client individuel" },
  { id: "entreprise_pme",    label: "Entreprise inf. 500 MF", icon: "🏢", desc: "PME / TPE" },
  { id: "entreprise_grande", label: "Entreprise sup. 500 MF", icon: "🏭", desc: "Grande entreprise" },
  { id: "institutionnel",    label: "Institutionnel",      icon: "🏛️", desc: "Organisation publique" },
  { id: "fournisseur",       label: "Fournisseur",         icon: "🤝", desc: "Partenaire BCEG" },
];

const DEMO_USER = { prenom: "Hermane", nom: "Pambo Taty", email: "hermannpambotaty@yahoo.com" };

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const lbl = { display:"block", fontSize:11, fontWeight:700, color:T_M, marginBottom:6, letterSpacing:0.8, textTransform:"uppercase" };
const inp = { width:"100%", padding:"14px 16px", background:"#EEECEA", border:"1.5px solid transparent", borderRadius:10, fontSize:15, color:T_D, outline:"none", boxSizing:"border-box" };
const cardS = { background:WHITE, borderRadius:16, padding:"18px 16px", boxShadow:"0 2px 16px rgba(58,65,48,0.09)", marginBottom:12 };
const gbtn = (ex={}) => ({ width:"100%", padding:"15px", fontFamily:"inherit", background:`linear-gradient(135deg,${G2},${G1})`, color:WHITE, border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:0.3, boxShadow:"0 6px 20px rgba(58,65,48,0.28)", ...ex });
const gbtnO = (ex={}) => ({ ...gbtn(), background:WHITE, color:G2, border:`2px solid ${G2}`, boxShadow:"none", ...ex });

// ═══════════════════════════════════════════════════════════
// BARK PATTERN SVG (motif écorce — charte BCEG pages 14-16)
// ═══════════════════════════════════════════════════════════
function Bark({ w=36, h="100%", op=0.16, col=WHITE }) {
  return (
    <svg width={w} height={h} viewBox="0 0 36 200" preserveAspectRatio="none" style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}>
      <path d="M18 0 C16 15,20 30,18 50 C16 70,20 90,17 115 C15 135,19 155,18 200" stroke={col} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M18 25 C10 28,6 34,8 42" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M18 25 C26 29,30 35,28 44" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M17 65 C9 68,5 74,7 82" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M17 65 C25 69,29 75,27 84" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M18 100 C10 103,6 109,8 117" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M17 140 C9 143,5 149,7 157" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M17 140 C25 144,29 150,27 159" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M18 175 C10 178,6 184,8 192" stroke={col} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={op}/>
      <path d="M8 0 C6 20,10 40,8 70 C6 95,10 120,8 160 C6 175,9 188,8 200" stroke={col} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={op*0.6}/>
      <path d="M28 0 C26 25,30 55,28 85 C26 110,30 140,28 170 C26 182,29 190,28 200" stroke={col} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={op*0.6}/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// GREEN HEADER
// ═══════════════════════════════════════════════════════════
function GH({ children, minH=200 }) {
  return (
    <div style={{ background:`linear-gradient(155deg,${G1} 0%,${G2} 60%,${G3} 100%)`, minHeight:minH, borderRadius:"0 0 32px 32px", position:"relative", overflow:"hidden" }}>
      <Bark />
      <div style={{ position:"absolute", top:-40, right:-30, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
      <div style={{ position:"absolute", top:30, right:60, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
      {children}
    </div>
  );
}

function TopBar({ onBack, title, subtitle, onRight, rightIcon, rightLabel }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"18px 18px 0", position:"relative", zIndex:2 }}>
      {onBack && <button onClick={onBack} style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:10, width:36, height:36, color:WHITE, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>←</button>}
      <div style={{ flex:1 }}>
        {title && <div style={{ color:WHITE, fontSize:15, fontWeight:700 }}>{title}</div>}
        {subtitle && <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>{subtitle}</div>}
      </div>
      {onRight && <button onClick={onRight} style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:10, padding:"6px 12px", color:WHITE, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>{rightIcon} {rightLabel}</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGO BCEG (Barlow Condensed = substitut Utendo)
// ═══════════════════════════════════════════════════════════
function Logo({ dark=false, large=false }) {
  const c = dark ? G2 : WHITE;
  return (
    <div style={{ textAlign:"center", padding: large?"36px 24px 20px":"28px 24px 14px", position:"relative", zIndex:2 }}>
      <div style={{ fontFamily:"'Barlow Condensed','Oswald','Arial Narrow',Arial,sans-serif", fontSize:large?52:42, fontWeight:900, color:c, letterSpacing:3, lineHeight:1, marginBottom:5 }}>BCEG</div>
      <div style={{ color:dark?T_L:"rgba(255,255,255,0.5)", fontSize:10, letterSpacing:2.5, fontWeight:400 }}>Réinventons l'avenir</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// UPLOAD ZONE
// ═══════════════════════════════════════════════════════════
function UZ({ hint, onFile, file }) {
  const ref = useRef();
  return (
    <div onClick={()=>ref.current?.click()} style={{ border:`2px dashed ${file?G2:BORDER}`, borderRadius:12, padding:"18px 14px", textAlign:"center", cursor:"pointer", background:file?"#EEF0EA":"#F8F7F4" }}>
      <div style={{ fontSize:24, marginBottom:4 }}>{file?"✅":"📎"}</div>
      {file ? <>
        <div style={{ fontSize:12, fontWeight:700, color:G2 }}>{file.name}</div>
        <div style={{ fontSize:11, color:T_L }}>{(file.size/1024).toFixed(0)} Ko</div>
      </> : <>
        <div style={{ fontSize:13, fontWeight:600, color:T_D }}>Cliquez pour ajouter</div>
        <div style={{ fontSize:11, color:T_L, marginTop:3 }}>{hint||"PDF, Image — max 10 Mo"}</div>
      </>}
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" style={{ display:"none" }} onChange={e=>onFile?.(e.target.files[0])}/>
    </div>
  );
}

function Alrt({ msg, type="error" }) {
  const isE=type==="error";
  return <div style={{ background:isE?"#FBF0EF":"#F5F3E8", color:isE?RED:"#6B5A00", border:`1px solid ${isE?"#F4CECA":"#E8DC8A"}`, padding:"10px 14px", borderRadius:10, marginBottom:14, fontSize:13, display:"flex", gap:8 }}><span>{isE?"⚠️":"💡"}</span><span>{msg}</span></div>;
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
function LoginScreen({ onLogin, onRegister }) {
  const [f, setF] = useState({ email:"", password:"" });
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState("");
  const go = () => { if(!f.email||!f.password){setErr("Veuillez remplir tous les champs.");return;} setErr(""); onLogin(f.email); };
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <GH minH={240}>
        <Logo large />
        <div style={{ textAlign:"center", padding:"0 24px 32px", position:"relative", zIndex:2 }}>
          <h1 style={{ color:WHITE, fontSize:22, fontWeight:800, marginBottom:6 }}>Connexion</h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>Accédez à votre espace client</p>
        </div>
      </GH>
      <div style={{ margin:"-24px 18px 0", ...cardS, padding:"28px 22px", boxShadow:"0 12px 48px rgba(58,65,48,0.14)" }}>
        {err && <Alrt msg={err}/>}
        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Email</label>
          <input type="email" value={f.email} placeholder="votre@email.com" onChange={e=>setF(p=>({...p,email:e.target.value}))} style={inp}/>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={lbl}>Mot de passe</label>
          <div style={{ position:"relative" }}>
            <input type={showP?"text":"password"} value={f.password} placeholder="Votre mot de passe" onChange={e=>setF(p=>({...p,password:e.target.value}))} style={{ ...inp, paddingRight:48 }} onKeyDown={e=>e.key==="Enter"&&go()}/>
            <button onClick={()=>setShowP(p=>!p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:17, color:T_M }}>{showP?"🙈":"👁️"}</button>
          </div>
        </div>
        <div style={{ textAlign:"right", marginBottom:22 }}><span style={{ color:G2, fontSize:13, fontWeight:600, cursor:"pointer" }}>Mot de passe oublié ?</span></div>
        <button onClick={go} style={gbtn()}>Se connecter</button>
        <div style={{ textAlign:"center", marginTop:20, fontSize:14, color:T_M }}>
          Pas encore de compte ?{" "}<span onClick={onRegister} style={{ color:G2, fontWeight:700, cursor:"pointer" }}>S'inscrire</span>
        </div>
      </div>
      <div style={{ textAlign:"center", padding:"28px", fontSize:11, color:T_L }}>Vos rêves, notre expertise !</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════
function RegisterScreen({ onBack, onRegister }) {
  const [f, setF] = useState({ prenom:"", nom:"", email:"", password:"", confirm:"" });
  const [errs, setErrs] = useState({});
  const go = () => {
    const e={};
    if(!f.prenom)e.prenom=1; if(!f.nom)e.nom=1; if(!f.email)e.email=1; if(!f.password)e.password=1;
    if(f.password!==f.confirm)e.confirm="Les mots de passe ne correspondent pas";
    if(Object.keys(e).length){setErrs(e);return;} setErrs({});
    onRegister({ prenom:f.prenom, nom:f.nom, email:f.email });
  };
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <GH minH={130}><TopBar onBack={onBack} title="Créer un compte" subtitle="Rejoignez l'espace BCEG"/><div style={{ height:30 }}/></GH>
      <div style={{ margin:"-20px 18px 0", ...cardS, padding:"26px 22px", boxShadow:"0 12px 48px rgba(58,65,48,0.14)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {[["prenom","Prénom *","Jean"],["nom","Nom *","DUPONT"]].map(([k,l,ph])=>(
            <div key={k}><label style={lbl}>{l}</label>
              <input value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={{ ...inp, borderColor:errs[k]?RED:"transparent" }}/>
            </div>
          ))}
        </div>
        {[["email","Email *","email","votre@email.com"],["password","Mot de passe *","password","••••••••"],["confirm","Confirmer *","password","••••••••"]].map(([k,l,t,ph])=>(
          <div key={k} style={{ marginBottom:14 }}>
            <label style={lbl}>{l}</label>
            <input type={t} value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={{ ...inp, borderColor:errs[k]?RED:"transparent" }}/>
            {errs[k]&&typeof errs[k]==="string"&&<div style={{ color:RED, fontSize:11, marginTop:4 }}>{errs[k]}</div>}
          </div>
        ))}
        <button onClick={go} style={gbtn({ marginTop:8 })}>Créer mon compte →</button>
        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:T_M }}>Déjà inscrit ? <span onClick={onBack} style={{ color:G2, fontWeight:700, cursor:"pointer" }}>Se connecter</span></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// OTP
// ═══════════════════════════════════════════════════════════
function OTPScreen({ email, onVerify, onBack }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [timer, setTimer] = useState(60);
  const [err, setErr] = useState("");
  const refs = useRef([]);
  const full = otp.join("");

  useEffect(()=>{ const iv=setInterval(()=>setTimer(t=>t>0?t-1:0),1000); return ()=>clearInterval(iv); },[]);

  const onD=(i,v)=>{ if(!/^\d?$/.test(v))return; const n=[...otp];n[i]=v;setOtp(n); if(v&&i<5)refs.current[i+1]?.focus(); };
  const onK=(i,e)=>{ if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus(); };
  const onP=e=>{ const t=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if(t.length===6){setOtp(t.split(""));refs.current[5]?.focus();} };
  const verify=()=>{ if(full.length<6){setErr("Entrez les 6 chiffres.");return;} setErr(""); onVerify(full); };

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <GH minH={240}>
        <div style={{ display:"flex", padding:"18px 18px 0", position:"relative", zIndex:2 }}>
          <button onClick={onBack} style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:10, width:36, height:36, color:WHITE, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        </div>
        <div style={{ textAlign:"center", padding:"18px 24px 28px", position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", width:64, height:64, borderRadius:18, background:"rgba(255,255,255,0.16)", border:"1.5px solid rgba(255,255,255,0.3)", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:14 }}>🔐</div>
          <h2 style={{ color:WHITE, fontSize:20, fontWeight:800, marginBottom:8 }}>Vérification de connexion</h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>Code envoyé à {email}</p>
        </div>
      </GH>
      <div style={{ margin:"-20px 18px 0", ...cardS, padding:"28px 22px", boxShadow:"0 12px 48px rgba(58,65,48,0.14)" }}>
        <Alrt msg="Code démo : 123456 — saisissez-le pour accéder" type="info"/>
        <label style={{ ...lbl, letterSpacing:2, marginBottom:14 }}>Code reçu par email</label>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <input value={full} onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,6); setOtp(v.split("").concat(Array(6-v.length).fill(""))); }} placeholder="0  0  0  0  0  0" style={{ ...inp, fontFamily:"monospace", fontSize:20, letterSpacing:10, fontWeight:800, textAlign:"center", flex:1 }} onPaste={onP}/>
          <button onClick={async()=>{ try{const t=await navigator.clipboard.readText();const v=t.replace(/\D/g,"").slice(0,6);if(v.length===6)setOtp(v.split(""));}catch{} }} style={{ padding:"0 14px", background:"#EEECEA", border:"1.5px solid "+BORDER, borderRadius:10, fontSize:13, fontWeight:700, color:T_D, cursor:"pointer", whiteSpace:"nowrap" }}>Coller</button>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
          {otp.map((d,i)=>(
            <input key={i} ref={el=>refs.current[i]=el} value={d} maxLength={1} inputMode="numeric"
              onChange={e=>onD(i,e.target.value)} onKeyDown={e=>onK(i,e)} onPaste={onP}
              style={{ width:42, height:50, textAlign:"center", fontSize:22, fontWeight:800, background:d?G2:"#EEECEA", color:d?WHITE:T_D, border:`2px solid ${d?G2:BORDER}`, borderRadius:10, outline:"none", cursor:"text", transition:"all .18s", fontFamily:"inherit" }}/>
          ))}
        </div>
        {err && <Alrt msg={err}/>}
        <button onClick={verify} disabled={full.length<6} style={gbtn({ opacity:full.length<6?.45:1, cursor:full.length<6?"default":"pointer" })}>Vérifier</button>
        <div style={{ textAlign:"center", marginTop:16, fontSize:14, color:T_M }}>
          {timer>0 ? <span>Renvoyer le code ({timer}s)</span> : <span style={{ color:G2, fontWeight:700, cursor:"pointer" }} onClick={()=>setTimer(60)}>Renvoyer le code</span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard({ user, claims, onNewClaim, onNavigate }) {
  const initial = user?.prenom?.[0]?.toUpperCase()||"?";
  const enCours = claims.filter(c=>c.statut==="En traitement").length;
  const cards = [
    { id:"assistant",  icon:"💬", label:"Assistant",    sub:"Poser une question",    bg:"#EEF2E8" },
    { id:"newClaim",   icon:"📋", label:"Réclamations", sub:"Suivi de vos demandes", bg:"#F5F0E4" },
    { id:"history",    icon:"🗂️", label:"Historique",   sub:"Mes dossiers",           bg:"#EAF0EE" },
    { id:"profile",    icon:"👤", label:"Mon Profil",   sub:"Informations",            bg:"#EDF0F5" },
  ];
  return (
    <div style={{ minHeight:"100vh", background:BG, paddingBottom:80 }}>
      <GH minH={0}>
        <TopBar title="Mon espace" onRight={()=>onNavigate("login")} rightIcon="⎋" rightLabel="Déconnexion"/>
        <div style={{ textAlign:"center", padding:"16px 24px 6px", position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.18)", border:"2.5px solid rgba(255,255,255,0.36)", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:WHITE, marginBottom:12 }}>{initial}</div>
          <h2 style={{ color:WHITE, fontSize:21, fontWeight:800, marginBottom:4 }}>Bonjour, {user?.prenom}</h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>{user?.email}</p>
        </div>
        <div style={{ margin:"14px 18px 0", background:"rgba(0,0,0,0.15)", borderRadius:14, padding:"14px 0", border:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex" }}>
            {[["0","Conversations"],[String(claims.length),"Réclamations"],[String(enCours),"En cours"]].map(([n,l],i)=>(
              <div key={i} style={{ flex:1, textAlign:"center", borderRight:i<2?"1px solid rgba(255,255,255,0.15)":"none" }}>
                <div style={{ color:WHITE, fontSize:22, fontWeight:800 }}>{n}</div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:28 }}/>
      </GH>
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
          {cards.map(c=>(
            <button key={c.id} onClick={()=>c.id==="newClaim"?onNewClaim():onNavigate(c.id)} style={{ ...cardS, border:"none", cursor:"pointer", textAlign:"left", marginBottom:0 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontSize:14, fontWeight:800, color:T_D, marginBottom:3 }}>{c.label}</div>
              <div style={{ fontSize:11, color:T_L }}>{c.sub}</div>
            </button>
          ))}
        </div>
        {claims.length===0 ? (
          <div style={{ ...cardS, textAlign:"center", padding:"32px 20px" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 14px", cursor:"pointer" }} onClick={onNewClaim}>📄</div>
            <h3 style={{ fontSize:15, fontWeight:700, color:T_D, marginBottom:6 }}>Aucune réclamation pour le moment</h3>
            <p style={{ fontSize:13, color:T_L, lineHeight:1.6 }}>Si vous rencontrez un problème,<br/>notre assistant est disponible</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:T_L, letterSpacing:1.2, marginBottom:10 }}>RÉCLAMATIONS RÉCENTES</div>
            {claims.slice(0,4).map(c=>{
              const sc={Nouvelle:["#DBEAFE","#1D4ED8"],"En traitement":["#FEF9C3","#7B5800"],Clôturée:["#DCFCE7","#166534"],Rejetée:["#FEE2E2","#991B1B"]}[c.statut]||["#F3F4F6","#374151"];
              const cat=POLES.find(p=>p.id===c.pole)?.items.find(i=>i.id===c.category)?.label||c.category;
              return (
                <div key={c.id} style={{ ...cardS, display:"flex", alignItems:"center", gap:12, padding:"13px 15px", marginBottom:8 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:"#EEF0EA", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>📋</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T_D, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cat}</div>
                    <div style={{ fontSize:11, color:T_L }}>{c.id} · {c.date}</div>
                  </div>
                  <div style={{ padding:"4px 10px", borderRadius:20, background:sc[0], color:sc[1], fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{c.statut}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={onNewClaim} style={{ position:"fixed", bottom:24, right:"calc(50% - 215px + 16px)", width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${G2},${G1})`, border:"none", color:WHITE, fontSize:28, cursor:"pointer", boxShadow:"0 8px 28px rgba(58,65,48,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>+</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NEW CLAIM FORM (4 étapes)
// ═══════════════════════════════════════════════════════════
function NewClaimForm({ onSubmit, onBack }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ profile:"", pole:"", category:"", agence:"", agenceNouvelle:"", description:"", montant:"", telephone:"", emailSuivi:"", files:{} });
  const pole = POLES.find(p=>p.id===form.pole);
  const item = pole?.items.find(i=>i.id===form.category);
  const extras = item?.extras||[];
  const can = [true, !!form.pole&&!!form.category, !!form.description, !!form.telephone];
  const SL = ["Catégorie","Détails","Documents"];

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <GH minH={0}>
        <TopBar onBack={step===1?onBack:()=>setStep(s=>Math.max(1,s-1))} title="Nouvelle réclamation" subtitle={`Étape ${step}/3 — ${SL[step-1]}`}/>
        <div style={{ padding:"14px 18px 22px", display:"flex", gap:0, alignItems:"center", position:"relative", zIndex:2 }}>
          {SL.map((l,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
              {i>0&&<div style={{ position:"absolute", top:13, right:"50%", width:"100%", height:2, background:i<=step-1?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.2)" }}/>}
              <div style={{ width:26, height:26, borderRadius:"50%", position:"relative", zIndex:1, background:i<step-1?"rgba(255,255,255,0.85)":i===step-1?WHITE:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4, boxShadow:i===step-1?"0 0 0 4px rgba(255,255,255,0.2)":"none" }}>
                <span style={{ fontSize:11, fontWeight:800, color:i<=step-1?G2:"rgba(255,255,255,0.5)" }}>{i<step-1?"✓":i+1}</span>
              </div>
              <span style={{ fontSize:9, color:i===step-1?WHITE:"rgba(255,255,255,0.45)", fontWeight:i===step-1?700:400, textAlign:"center" }}>{l}</span>
            </div>
          ))}
        </div>
      </GH>

      <div style={{ padding:"16px 16px 100px" }}>
        {step===1 && (
          <div>
            <div style={cardS}>
              <h3 style={{ fontSize:15, fontWeight:800, color:T_D, marginBottom:4 }}>Choisissez un pôle</h3>
              <p style={{ fontSize:12, color:T_M, marginBottom:16 }}>Quel service est concerné ?</p>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {POLES.map(p=>(
                  <button key={p.id} onClick={()=>setForm(f=>({...f,pole:p.id,category:""}))} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, border:`2px solid ${form.pole===p.id?G2:BORDER}`, background:form.pole===p.id?"#EEF0EA":WHITE, cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:form.pole===p.id?G2:BG, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{p.icon}</div>
                    <span style={{ fontSize:13, fontWeight:700, color:form.pole===p.id?G2:T_D, flex:1 }}>{p.label}</span>
                    {form.pole===p.id&&<span style={{ color:G2, fontSize:16 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            {form.pole && (
              <div style={cardS}>
                <h3 style={{ fontSize:14, fontWeight:800, color:T_D, marginBottom:14 }}>Type de réclamation</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {POLES.find(p=>p.id===form.pole)?.items.map(item=>(
                    <button key={item.id} onClick={()=>setForm(f=>({...f,category:item.id}))} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`2px solid ${form.category===item.id?G2:BORDER}`, background:form.category===item.id?"#EEF0EA":"#FAFAF8", cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:form.category===item.id?G2:GRAY, flexShrink:0 }}/>
                      <span style={{ fontSize:14, fontWeight:600, color:form.category===item.id?G2:T_D, flex:1 }}>{item.label}</span>
                      {item.extras.length>0&&<span style={{ fontSize:10, color:T_L, background:BG, padding:"2px 8px", borderRadius:20 }}>+docs</span>}
                      {form.category===item.id&&<span style={{ color:G2, fontSize:15 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step===2 && (
          <div style={cardS}>
            <h3 style={{ fontSize:15, fontWeight:800, color:T_D, marginBottom:4 }}>Détails de votre réclamation</h3>
            <p style={{ fontSize:12, color:T_M, marginBottom:18 }}>Plus vous êtes précis, plus vite nous traitons votre dossier.</p>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Agence concernée</label>
              <select value={form.agence} onChange={e=>setForm(f=>({...f,agence:e.target.value}))} style={inp}>
                <option value="">-- Sélectionnez --</option>{AGENCES.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
            {extras.includes("montant")&&<div style={{ marginBottom:16 }}><label style={lbl}>Montant concerné (FCFA)</label><input type="number" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value}))} placeholder="Ex : 150 000" style={inp}/></div>}
            {extras.includes("choix_agence")&&<div style={{ marginBottom:16 }}><label style={lbl}>Agence pour le nouveau gestionnaire</label><select value={form.agenceNouvelle} onChange={e=>setForm(f=>({...f,agenceNouvelle:e.target.value}))} style={inp}><option value="">-- Sélectionnez --</option>{AGENCES.map(a=><option key={a}>{a}</option>)}</select></div>}
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Description détaillée *</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Décrivez précisément : date des faits, montant, numéro d'opération..." rows={5} style={{ ...inp, resize:"vertical", lineHeight:1.6, fontFamily:"inherit" }}/>
            </div>
            {extras.filter(e=>e.startsWith("upload")).map(ext=>{
              const UL={upload_lettre:"Joindre la lettre de demande",upload_releve:"Joindre le relevé",upload_facture:"Joindre la facture",upload_bon:"Joindre le bon de commande"};
              return <div key={ext} style={{ marginBottom:14 }}><label style={{ ...lbl, marginBottom:8 }}>{UL[ext]||"Document annexe"}</label><UZ hint="PDF, Image, Word" onFile={file=>setForm(f=>({...f,files:{...f.files,[ext]:file}}))} file={form.files[ext]}/></div>;
            })}
          </div>
        )}

        {step===4 && (
          <div>
            <div style={{ ...cardS, background:"#F5F0E4", border:"1px solid #E8DC8A", display:"flex", gap:12, padding:"16px" }}>
              <span style={{ fontSize:22 }}>🔒</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#6B5A00", marginBottom:3 }}>Vérification d'identité requise</div>
                <div style={{ fontSize:12, color:"#7B6A10", lineHeight:1.5 }}>Une pièce d'identité valide et votre numéro de téléphone sont obligatoires.</div>
              </div>
            </div>
            <div style={cardS}><h3 style={{ fontSize:14, fontWeight:800, color:T_D, marginBottom:14 }}>Pièce d'identité *</h3><UZ hint="CNI, Passeport — PDF, Image" onFile={file=>setForm(f=>({...f,files:{...f.files,identite:file}}))} file={form.files.identite}/></div>
            <div style={cardS}>
              <h3 style={{ fontSize:14, fontWeight:800, color:T_D, marginBottom:14 }}>Coordonnées de contact</h3>
              <div style={{ marginBottom:14 }}><label style={lbl}>Numéro de téléphone *</label><input type="tel" value={form.telephone} onChange={e=>setForm(f=>({...f,telephone:e.target.value}))} placeholder="06 12 34 56" style={inp}/></div>
              <div><label style={lbl}>Email de suivi (optionnel)</label><input type="email" value={form.emailSuivi} onChange={e=>setForm(f=>({...f,emailSuivi:e.target.value}))} placeholder="votre@email.com" style={inp}/></div>
            </div>
            <div style={cardS}>
              <div style={{ fontSize:10, fontWeight:700, color:T_L, letterSpacing:1.2, marginBottom:12 }}>RÉCAPITULATIF DU DOSSIER</div>
              {[["Pôle",pole?.label],["Réclamation",item?.label],["Agence",form.agence||"Non précisée"],form.montant?["Montant",form.montant+" FCFA"]:null].filter(Boolean).map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid "+BORDER }}>
                  <span style={{ fontSize:12, color:T_M }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:T_D, maxWidth:"60%", textAlign:"right" }}>{v||"—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"14px 18px 20px", background:"rgba(245,243,239,0.96)", backdropFilter:"blur(12px)", borderTop:"1px solid "+BORDER, boxSizing:"border-box" }}>
        {step<4
          ? <button onClick={()=>setStep(s=>s+1)} disabled={!can[step-1]} style={gbtn({ opacity:can[step-1]?1:.4, cursor:can[step-1]?"pointer":"default" })}>Suivant →</button>
          : <button onClick={()=>onSubmit(form)} disabled={!can[3]} style={gbtn({ opacity:can[3]?1:.4, cursor:can[3]?"pointer":"default" })}>✓ Soumettre la réclamation</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUCCESS
// ═══════════════════════════════════════════════════════════
function SuccessScreen({ num, onDashboard, onHistory }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 22px 80px" }}>
      <div style={{ width:88, height:88, borderRadius:"50%", background:`linear-gradient(135deg,${G2},${G1})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, marginBottom:24, boxShadow:"0 12px 40px rgba(58,65,48,0.38)" }}>✓</div>
      <h2 style={{ fontSize:23, fontWeight:800, color:T_D, marginBottom:8, textAlign:"center" }}>Réclamation enregistrée !</h2>
      <p style={{ fontSize:14, color:T_M, textAlign:"center", lineHeight:1.7, marginBottom:28 }}>Votre dossier a été soumis avec succès.<br/>Conservez votre numéro de suivi :</p>
      {/* Tracking card avec bark */}
      <div style={{ ...cardS, textAlign:"center", padding:"22px 28px 22px 44px", width:"100%", maxWidth:340, marginBottom:14, position:"relative", overflow:"hidden" }}>
        <Bark w={30} h={90} op={0.12} col={G2}/>
        <div style={{ fontSize:10, fontWeight:700, color:T_L, letterSpacing:2, marginBottom:10 }}>NUMÉRO DE SUIVI</div>
        <div style={{ fontFamily:"'Barlow Condensed',monospace", fontSize:22, fontWeight:900, color:G2, letterSpacing:2.5 }}>{num}</div>
        <div style={{ fontSize:11, color:T_L, marginTop:8 }}>Transmettez ce numéro pour tout suivi</div>
      </div>
      <div style={{ background:"#EEF0EA", borderRadius:12, padding:"14px 18px", border:"1px solid "+BORDER, marginBottom:32, width:"100%", maxWidth:340 }}>
        <div style={{ fontSize:12, color:G1, textAlign:"center", lineHeight:1.6 }}>⏱️ Notre équipe vous contactera dans les <strong>48 heures ouvrables</strong></div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:340 }}>
        <button onClick={onHistory} style={gbtn()}>Voir mes réclamations</button>
        <button onClick={onDashboard} style={gbtnO()}>Retour à l'accueil</button>
      </div>
      <p style={{ fontSize:11, color:T_L, marginTop:28, textAlign:"center" }}>Innovez, entreprrenez et réussissez ! 🌿</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════
function HistoryScreen({ claims, onBack, onNewClaim }) {
  const SC = { Nouvelle:["#DBEAFE","#1D4ED8"], "En traitement":["#FEF9C3","#7B5800"], Clôturée:["#DCFCE7","#166534"], Rejetée:["#FEE2E2","#991B1B"] };
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <GH minH={0}><TopBar onBack={onBack} title="Mes Réclamations" subtitle="Suivi de vos dossiers" onRight={onNewClaim} rightIcon="+" rightLabel="Nouveau"/><div style={{ height:28 }}/></GH>
      <div style={{ padding:"16px 16px 40px" }}>
        {claims.length===0 ? (
          <div style={{ ...cardS, textAlign:"center", padding:"48px 24px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
            <h3 style={{ fontSize:15, fontWeight:700, color:T_D, marginBottom:8 }}>Aucun dossier pour le moment</h3>
            <p style={{ fontSize:13, color:T_L, marginBottom:20 }}>Déposez votre première réclamation</p>
            <button onClick={onNewClaim} style={{ ...gbtn(), width:"auto", padding:"12px 28px" }}>Déposer une réclamation</button>
          </div>
        ) : (
          claims.map(c=>{
            const sc=SC[c.statut]||["#F3F4F6","#374151"];
            const polN=POLES.find(p=>p.id===c.pole)?.label||c.pole;
            const catN=POLES.find(p=>p.id===c.pole)?.items.find(i=>i.id===c.category)?.label||c.category;
            return (
              <div key={c.id} style={{ ...cardS, marginBottom:10, position:"relative", overflow:"hidden" }}>
                <Bark w={18} h={70} op={0.07} col={G2}/>
                <div style={{ paddingLeft:8 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ flex:1, marginRight:10 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:T_D, marginBottom:3 }}>{catN}</div>
                      <div style={{ fontSize:11, color:T_L }}>{polN}</div>
                    </div>
                    <div style={{ padding:"4px 10px", borderRadius:20, background:sc[0], color:sc[1], fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{c.statut}</div>
                  </div>
                  <div style={{ display:"flex", gap:16, paddingTop:10, borderTop:"1px solid "+BORDER, flexWrap:"wrap" }}>
                    {[["Référence",c.id,true],["Date",c.date,false],["Profil",PROFILES.find(p=>p.id===c.profile)?.label||"—",false]].map(([k,v,m])=>(
                      <div key={k}><div style={{ fontSize:10, color:T_L, marginBottom:2 }}>{k}</div><div style={{ fontSize:12, fontWeight:700, color:T_D, fontFamily:m?"'Barlow Condensed',monospace":"inherit" }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════
function ProfileScreen({ user, onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <GH minH={0}>
        <TopBar onBack={onBack} title="Mon Profil"/>
        <div style={{ textAlign:"center", padding:"18px 24px 24px", position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.18)", border:"2.5px solid rgba(255,255,255,0.36)", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:WHITE, marginBottom:10 }}>{user?.prenom?.[0]}</div>
          <div style={{ color:WHITE, fontSize:17, fontWeight:800 }}>{user?.prenom} {user?.nom}</div>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginTop:3 }}>Client BCEG</div>
        </div>
      </GH>
      <div style={{ padding:"16px 16px 40px" }}>
        {[["Prénom",user?.prenom],["Nom",user?.nom],["Email",user?.email],["Téléphone","Non renseigné"],["Agence principale","Non renseignée"],["Type de client","Particulier"]].map(([k,v])=>(
          <div key={k} style={{ ...cardS, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"15px 18px", marginBottom:8 }}>
            <span style={{ fontSize:13, color:T_M }}>{k}</span>
            <span style={{ fontSize:13, fontWeight:700, color:T_D }}>{v}</span>
          </div>
        ))}
        <button style={gbtn({ marginTop:12 })}>Modifier mes informations</button>
        <button onClick={onBack} style={gbtnO({ marginTop:10 })}>Retour</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ASSISTANT
// ═══════════════════════════════════════════════════════════
function AssistantScreen({ onBack }) {
  useEffect(()=>{
    // Ouvre Yanis Moussavou (Hub BCEG) avec le chat déjà ouvert
    window.open("https://dapper-tulumba-db53a5.netlify.app?chat=open", "_blank");
    onBack();
  },[]);
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:BG, gap:18 }}>
      <div style={{ width:72, height:72, borderRadius:22, background:G2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, boxShadow:"0 8px 24px rgba(58,65,48,.2)" }}>💬</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:900, color:T_D, letterSpacing:.5 }}>Yanis Moussavou</div>
      <div style={{ fontSize:13, color:GRAY, textAlign:"center", maxWidth:240, lineHeight:1.6 }}>Votre assistant bancaire s’ouvre dans une nouvelle fenêtre…</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [successNum, setSuccessNum] = useState("");

  const handleLogin = (email) => { setPendingEmail(email); setPendingUser(DEMO_USER); setScreen("otp"); };
  const handleRegister = (data) => { setPendingEmail(data.email); setPendingUser(data); setScreen("otp"); };
  const handleOTP = (code) => { if(code.length===6){ setUser(pendingUser); setScreen("dashboard"); } };
  const handleSubmit = (form) => {
    const num = "BCEG-2026-"+Math.floor(1000+Math.random()*9000);
    setClaims(prev=>[{ id:num, date:new Date().toLocaleDateString("fr-FR"), pole:form.pole, category:form.category, statut:"Nouvelle", profile:form.profile },...prev]);
    setSuccessNum(num); setScreen("success");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',-apple-system,'Segoe UI',Arial,sans-serif;background:#E0DDD6;}
        input,select,textarea,button{font-family:inherit;}
        input::placeholder,textarea::placeholder{color:#9AA395;}
        select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239AA395' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:40px!important;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#A6AA9E;border-radius:4px;}
        button:active{transform:scale(0.97);}
        @keyframes pulse{0%,100%{transform:scale(.7);opacity:.5}50%{transform:scale(1);opacity:1}}
      `}</style>
      <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:WHITE, position:"relative", overflow:"hidden", boxShadow:"0 0 80px rgba(0,0,0,0.12)" }}>
        {screen==="login"     && <LoginScreen    onLogin={handleLogin} onRegister={()=>setScreen("register")}/>}
        {screen==="register"  && <RegisterScreen onBack={()=>setScreen("login")} onRegister={handleRegister}/>}
        {screen==="otp"       && <OTPScreen      email={pendingEmail} onVerify={handleOTP} onBack={()=>setScreen("login")}/>}
        {screen==="dashboard" && <Dashboard      user={user} claims={claims} onNewClaim={()=>setScreen("newClaim")} onNavigate={setScreen}/>}
        {screen==="newClaim"  && <NewClaimForm   onSubmit={handleSubmit} onBack={()=>setScreen("dashboard")}/>}
        {screen==="success"   && <SuccessScreen  num={successNum} onDashboard={()=>setScreen("dashboard")} onHistory={()=>setScreen("history")}/>}
        {screen==="history"   && <HistoryScreen  claims={claims} onBack={()=>setScreen("dashboard")} onNewClaim={()=>setScreen("newClaim")}/>}
        {screen==="profile"   && <ProfileScreen  user={user} onBack={()=>setScreen("dashboard")}/>}
        {screen==="assistant" && <AssistantScreen onBack={()=>setScreen("dashboard")}/>}
      </div>
    </>
  );
}
