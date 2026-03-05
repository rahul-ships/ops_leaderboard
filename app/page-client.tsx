"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import {
  Trophy, TrendingUp, Users, User, Star, Flame, Target,
  Award, Crown, Zap, Clock, BarChart3, Activity, Shield, X,
  ChevronLeft, Menu, Camera, Plus
} from "lucide-react";

var DARK = {
  nv: "#0A1628", db: "#0F2847", el: "#00E5A0", go: "#FFD700",
  am: "#F59E0B", co: "#FF6B6B", pu: "#8B5CF6", sk: "#38BDF8",
  wh: "#FFF", g3: "#CBD5E1", g4: "#94A3B8", g5: "#64748B",
  g6: "#475569", g7: "#334155"
};
var LIGHT = {
  nv: "#F8FAFC", db: "#FFFFFF", el: "#059669", go: "#D97706",
  am: "#D97706", co: "#DC2626", pu: "#7C3AED", sk: "#0284C7",
  wh: "#0F172A", g3: "#334155", g4: "#64748B", g5: "#94A3B8",
  g6: "#CBD5E1", g7: "#E2E8F0"
};
var C = DARK;
var CC = ["#00E5A0","#38BDF8","#8B5CF6","#FFD700","#FF6B6B","#FF8C42","#14B8A6","#F472B6"];
var BDS = ["Booking Done","Invoice Raised","Collection Done","Collection Done And Closed","Loyalty Reward","Loyalty Reward Issued","EOI Submitted"];
var SM = {L:"Live",D:"Dropped",H:"On Hold",B:"Booking Done",I:"Invoice Raised",C:"Collection Done And Closed",R:"Loyalty Reward Issued",E:"EOI Submitted"};
var QS = ["Every deal you close is a family finding their dream home.","Champions are made from desire, dreams, and vision.","The difference between ordinary and extraordinary is that little extra.","Small daily improvements lead to stunning results."];
var LVLS = [{n:"Rookie",m:0,c:"#94A3B8",i:"🌱",d:"Starting out. Build pipeline & complete discoveries."},{n:"Explorer",m:15,c:"#38BDF8",i:"🧭",d:"Score 15+. Improving conversion & getting first bookings."},{n:"Pro",m:30,c:"#8B5CF6",i:"💎",d:"Score 30+. Solid conversion rate with consistent bookings."},{n:"Expert",m:50,c:"#00E5A0",i:"🏆",d:"Score 50+. High conversion, strong bookings & fast TAT."},{n:"Master",m:70,c:"#FFD700",i:"👑",d:"Score 70+. Top-tier across all 3 metrics."},{n:"Legend",m:85,c:"#FF6B6B",i:"🔥",d:"Score 85+. Elite performer. Best conversion, bookings & TAT."}];
// Data will be fetched from API
var NM = [];
var RW = [];

function parseData(nmData, rwData) {
  // Use provided data or fallback to module-level variables
  var nm = nmData || NM;
  var rw = rwData || RW;

  var base = new Date(2025, 3, 1);

  // Helper function to convert month and year to financial quarter (April start)
  function toFinancialQuarter(monthIndex, year) {
    if (!monthIndex || !year) return "";
    // Financial year quarters (April start): AMJ, JAS, OND, JFM
    var quarters = {
      4: "AMJ", 5: "AMJ", 6: "AMJ",           // Apr-Jun: Q1
      7: "JAS", 8: "JAS", 9: "JAS",           // Jul-Sep: Q2
      10: "OND", 11: "OND", 12: "OND",        // Oct-Dec: Q3
      1: "JFM", 2: "JFM", 3: "JFM"            // Jan-Mar: Q4
    };
    var qName = quarters[monthIndex];
    // Use the calendar year (so JFM'26 means Jan-Mar 2026)
    return qName + "'" + String(year).slice(2);  // AMJ'25, JAS'25, JFM'26, etc.
  }

  return rw.map(function(r, i) {
    function toDate(days) {
      if (!days) return "";
      var d = new Date(base.getTime() + days * 864e5);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + day;
    }
    var cd = toDate(r[5]);
    var mo = cd ? cd.slice(0, 7) : "";
    var qi = cd ? parseInt(cd.slice(5, 7)) : 0;
    var qYear = cd ? parseInt(cd.slice(0, 4)) : 0;

    // Handle booking month - could be numeric (1-12) or already in YYYY-MM format
    var bm_raw = (r[10] || "").toString().trim();
    var bm = "";
    var bqi = 0;

    if (bm_raw) {
      if (bm_raw.includes("-")) {
        // Already in YYYY-MM format
        bm = bm_raw;
        bqi = parseInt(bm.slice(5, 7));
      } else {
        // Numeric month - convert to date format
        var bm_num = parseInt(bm_raw);
        if (bm_num > 0 && bm_num <= 12) {
          // Use 2025 as base year, or 2026 if month is from current/future cycles
          var book_date = new Date(base.getTime() + (r[9] || 0) * 864e5);
          if (book_date.getMonth() + 1 <= bm_num) {
            // Month is in the same year as booking
            bm = book_date.getFullYear() + "-" + String(bm_num).padStart(2, "0");
          } else {
            // Month is in following year
            bm = (book_date.getFullYear() + 1) + "-" + String(bm_num).padStart(2, "0");
          }
          bqi = bm_num;
        }
      }
    }

    var bq = bqi ? toFinancialQuarter(bqi, bm ? parseInt(bm.slice(0, 4)) : 0) : "";

    return {
      id: i, cn: r[0], st: SM[r[1]] || "Live",
      go: r[2] >= 0 ? nm[r[2]] : "", rp: r[3] >= 0 ? nm[r[3]] : "", tp: r[4] >= 0 ? nm[r[4]] : "",
      cd: cd, dd: toDate(r[6]), sd: toDate(r[7]), svd: toDate(r[8]), bd: toDate(r[9]),
      dvd: toDate(r[11]), amt: r[12] || 0,
      mo: mo, q: toFinancialQuarter(qi, qYear), yr: cd ? cd.slice(0, 4) : "",
      bm: bm, bq: bq, byr: bm && bm.length > 0 ? bm.slice(0, 4) : ""
    };
  });
}

function ml(m) {
  if (!m) return "";
  var ms = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var p = m.split("-");
  return p.length === 2 ? ms[parseInt(p[1]) - 1] + " " + p[0] : m;
}
function dbt(a, b) {
  if (!a || !b) return null;
  try { var d = Math.round((new Date(b) - new Date(a)) / 864e5); return d > 0 ? d : null; } catch(e) { return null; }
}
function gl(t) {
  var l = LVLS[0];
  for (var i = 0; i < LVLS.length; i++) { if (t >= LVLS[i].m) l = LVLS[i]; }
  return l;
}
function calcScore(cr, bk, avgT, maxBk, tst, maxTst) {
  // 25% each: Conversion, Bookings, TAT, Testimonials
  var convNorm = Math.min(parseFloat(cr || 0) / 30 * 100, 100);
  var bkNorm = maxBk > 0 ? Math.min(bk / maxBk * 100, 100) : 0;
  var tatNorm = 0;
  if (avgT != null && avgT > 0) {
    tatNorm = Math.max(0, (1 - avgT / 90)) * 100;
  }
  var tstNorm = (maxTst || 0) > 0 ? Math.min((tst || 0) / maxTst * 100, 100) : 0;
  return Math.round(0.25 * convNorm + 0.25 * bkNorm + 0.25 * tatNorm + 0.25 * tstNorm);
}

function isBk(st) { return BDS.indexOf(st) >= 0; }
function convColor(cr) {
  var v = parseFloat(cr || 0);
  if (v >= 20) return {bg: "#00E5A022", c: "#00E5A0"};
  if (v >= 15) return {bg: "#F59E0B22", c: "#F59E0B"};
  return {bg: "#FF6B6B22", c: "#FF6B6B"};
}

function calcMetrics(deals, fm, fq, fy, tests, bkMode, currentFYQuarters) {
  var f = deals;
  var fmFilter = fm, fqFilter = fq, fyFilter = fy;

  // Filter by CREATION date for deal count (pipeline assigned)
  if (fm && fm !== "all") f = f.filter(function(d) { return d.mo === fm; });
  else if (fq === "currentfy") {
    f = f.filter(function(d) {
      if (!currentFYQuarters || !d.q) return false;
      for (var i = 0; i < currentFYQuarters.length; i++) {
        if (d.q === currentFYQuarters[i]) return true;
      }
      return false;
    });
  }
  else if (fq && fq !== "all") f = f.filter(function(d) { return d.q === fq && (fy === "all" || d.yr === fy); });
  else if (fy && fy !== "all") f = f.filter(function(d) { return d.yr === fy; });
  var fSet = new Set(f.map(function(d){return d.id}));
  var am = {}, mm = {};
  var countedBookings = new Set(); // Track which deals have been counted as bookings in realtime mode
  deals.forEach(function(d) {
    var inCreatedPeriod = fSet.has(d.id);
    var advs = [d.go, d.rp].filter(Boolean);
    var uniq = advs.filter(function(v, i, a) { return a.indexOf(v) === i; });
    uniq.forEach(function(n) {
      if (!am[n]) am[n] = {name:n,type:"advisor",da:0,live:0,disc:0,sh:0,sv:0,bk:0,tst:0,td:0,tat:[],bkc:[]};
      var a = am[n];
      if (inCreatedPeriod) { a.da++; a.td++; if (d.st === "Live") a.live++; if (d.dd) a.disc++; if (d.sd) a.sh++; if (d.svd) a.sv++; }
      if (isBk(d.st)) {
        var bkMatch = false;
        if (bkMode === "cohort") {
          bkMatch = inCreatedPeriod;
        } else {
          bkMatch = true;
          if (fmFilter && fmFilter !== "all") bkMatch = d.bm === fmFilter;
          else if (fqFilter === "currentfy") {
            bkMatch = false;
            if (currentFYQuarters && d.bq) {
              for (var qi = 0; qi < currentFYQuarters.length; qi++) {
                if (d.bq === currentFYQuarters[qi]) {
                  bkMatch = true;
                  break;
                }
              }
            }
          }
          else if (fqFilter && fqFilter !== "all") bkMatch = d.bq === fqFilter && (fyFilter === "all" || d.byr === fyFilter);
          else if (fyFilter && fyFilter !== "all") bkMatch = d.byr === fyFilter;
        }
        if (bkMatch) {
          // In realtime mode, only count each booking deal once across all advisors
          if (bkMode === "realtime" && !countedBookings.has(d.id)) {
            countedBookings.add(d.id);
          }
          a.bk++;
          a.bkc.push(d.cn);
          var t = dbt(d.cd, d.bd);
          if (t && t > 0) a.tat.push(t);
        }
      }
    });
    if (d.tp) {
      if (!mm[d.tp]) mm[d.tp] = {name:d.tp,type:"market_advisor",da:0,live:0,disc:0,sh:0,sv:0,bk:0,tst:0,td:0,tat:[],bkc:[]};
      var m = mm[d.tp];
      if (inCreatedPeriod) { m.da++; m.td++; if (d.st === "Live") m.live++; if (d.dd) m.disc++; if (d.sd) m.sh++; if (d.svd) m.sv++; }
      if (isBk(d.st)) {
        var bkMP = false;
        if (bkMode === "cohort") {
          bkMP = inCreatedPeriod;
        } else {
          bkMP = true;
          if (fmFilter && fmFilter !== "all") bkMP = d.bm === fmFilter;
          else if (fqFilter === "currentfy") {
            bkMP = false;
            if (currentFYQuarters && d.bq) {
              for (var qj = 0; qj < currentFYQuarters.length; qj++) {
                if (d.bq === currentFYQuarters[qj]) {
                  bkMP = true;
                  break;
                }
              }
            }
          }
          else if (fqFilter && fqFilter !== "all") bkMP = d.bq === fqFilter && (fyFilter === "all" || d.byr === fyFilter);
          else if (fyFilter && fyFilter !== "all") bkMP = d.byr === fyFilter;
        }
        if (bkMP) {
          // Track unique bookings in realtime mode (already tracked in advisor section)
          m.bk++;
          m.bkc.push(d.cn);
        }
      }
    }
  });
  Object.values(am).concat(Object.values(mm)).forEach(function(x) {
    x.tst = (tests || []).filter(function(t) { return t.an === x.name; }).length;
    x.cr = x.da > 0 ? ((x.bk / x.da) * 100).toFixed(1) : "0.0";
    x.avgT = x.tat.length ? Math.round(x.tat.reduce(function(a, b) { return a + b; }, 0) / x.tat.length) : null;
  });

  return { adv: Object.values(am), ma: Object.values(mm), fd: f, uniqueBookings: countedBookings.size };
}

function calcFunnel(deals) {
  var t = deals.length;
  var di = deals.filter(function(d){return d.dd}).length;
  var sh = deals.filter(function(d){return d.sd}).length;
  var sv = deals.filter(function(d){return d.svd}).length;
  var dv = deals.filter(function(d){return d.dvd}).length;
  var bk = deals.filter(function(d){return isBk(d.st)}).length;
  var dr = deals.filter(function(d){return d.st==="Dropped"||d.st==="On Hold"}).length;
  return [{s:"Assigned",c:t,p:100},{s:"Discovery",c:di,p:t?((di/t)*100).toFixed(1):0},{s:"Shortlist",c:sh,p:t?((sh/t)*100).toFixed(1):0},{s:"Site Visit",c:sv,p:t?((sv/t)*100).toFixed(1):0},{s:"Deep Dive",c:dv,p:t?((dv/t)*100).toFixed(1):0},{s:"Booking",c:bk,p:t?((bk/t)*100).toFixed(1):0},{s:"Drop/Hold",c:dr,p:t?((dr/t)*100).toFixed(1):0}];
}


function calcTrend(deals, name, bkMode) {
  var mos = Array.from(new Set(deals.map(function(d){return d.mo}).filter(Boolean))).sort();
  var myDeals = deals.filter(function(d){return d.go===name||d.rp===name||d.tp===name});
  return mos.map(function(m) {
    var created = myDeals.filter(function(d){return d.mo===m});
    var booked = bkMode==="cohort" ? created.filter(function(d){return isBk(d.st)}) : myDeals.filter(function(d){return d.bm===m});
    var conv = created.length > 0 ? parseFloat((booked.length/created.length*100).toFixed(1)) : 0;
    var tats = [];
    booked.forEach(function(d){var t=dbt(d.cd,d.bd);if(t&&t>0)tats.push(t)});
    var avgTat = tats.length ? Math.round(tats.reduce(function(a,b){return a+b},0)/tats.length) : 0;
    return {month:ml(m),bookings:booked.length,conv:conv,tat:avgTat};
  });
}

function calcCombos(deals) {
  var co = {};
  deals.forEach(function(d) {
    [d.go,d.rp].filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i}).forEach(function(adv) {
      if (d.tp) {
        var k = adv + "|" + d.tp;
        if (!co[k]) co[k] = {a:adv,m:d.tp,d:0,b:0};
        co[k].d++;
        if (isBk(d.st)) co[k].b++;
      }
    });
  });
  return Object.values(co).map(function(c){return Object.assign({},c,{r:c.d?((c.b/c.d)*100).toFixed(1):"0.0"})}).sort(function(a,b){return b.b-a.b});
}

function AC({value}) {
  var [d, setD] = useState(0);
  useEffect(function() {
    var t = typeof value === "number" ? value : parseFloat(value) || 0;
    var s = Date.now();
    function tick() {
      var p = Math.min((Date.now() - s) / 800, 1);
      setD(Math.round(t * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    }
    tick();
  }, [value]);
  return <span>{d}</span>;
}

function RB({rank}) {
  if (rank === 1) return (<span style={{fontSize:26}}>🥇</span>);
  if (rank === 2) return (<span style={{fontSize:24}}>🥈</span>);
  if (rank === 3) return (<span style={{fontSize:22}}>🥉</span>);
  return (<span style={{fontSize:13,fontWeight:700,color:C.g4,fontFamily:"monospace"}}>{"#"+rank}</span>);
}

function LvlBadge({score}) {
  var [tip, setTip] = useState(false);
  var l = gl(score);
  var idx = LVLS.indexOf(l);
  var nx = idx < LVLS.length-1 ? LVLS[idx+1] : null;
  var p = nx ? ((score-l.m)/(nx.m-l.m))*100 : 100;
  return (
    <div style={{display:"flex",alignItems:"center",gap:4,position:"relative"}}>
      <span style={{fontSize:13}}>{l.i}</span>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <span style={{fontSize:9,fontWeight:700,color:l.c,textTransform:"uppercase"}}>{l.n}</span>
          <span onClick={function(e){e.stopPropagation();setTip(!tip)}} style={{width:12,height:12,borderRadius:"50%",background:l.c+"25",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:7,color:l.c,cursor:"pointer",fontWeight:700,flexShrink:0}}>i</span>
        </div>
        {nx && <div style={{width:36,height:3,background:C.g7,borderRadius:2,marginTop:1}}><div style={{width:p+"%",height:"100%",background:l.c,borderRadius:2}}/></div>}
      </div>
      {tip && <div onClick={function(e){e.stopPropagation();setTip(false)}} style={{position:"absolute",bottom:"100%",left:0,marginBottom:6,background:C.nv,border:"1px solid "+l.c+"40",borderRadius:8,padding:"8px 10px",fontSize:10,color:C.g3,width:180,zIndex:100,lineHeight:1.4,boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}><div style={{fontWeight:700,color:l.c,marginBottom:3}}>{l.i+" "+l.n+" ("+l.m+"+ pts)"}</div>{l.d}<div style={{marginTop:4,fontSize:9,color:C.g5}}>Score: 25% Conv + 25% Bookings + 25% TAT + 25% Testimonials</div></div>}
    </div>
  );
}

function MC({icon:Ic,label,value,subtitle,color,small}) {
  var cl = color || C.el;
  return (
    <div style={{background:"linear-gradient(135deg,"+C.db+","+C.nv+")",border:"1px solid "+cl+"22",borderRadius:14,padding:small?"9px 11px":"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
        {Ic && <Ic size={small?13:16} color={cl}/>}
        <span style={{fontSize:small?9:10,color:C.g4,fontWeight:600,textTransform:"uppercase"}}>{label}</span>
      </div>
      <div style={{fontSize:small?18:24,fontWeight:800,color:C.wh,fontFamily:"monospace"}}>
        <AC value={typeof value==="string"?parseFloat(value)||0:value}/>
        {typeof value==="string"&&value.indexOf("%")>=0&&<span style={{fontSize:small?11:14,color:cl}}>%</span>}
      </div>
      {subtitle&&<div style={{fontSize:9,color:C.g5,marginTop:2}}>{subtitle}</div>}
    </div>
  );
}

function Funnel({data}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {data.map(function(d,i) {
        var w = (parseFloat(d.p)/100)*100;
        var color = d.s==="Drop/Hold"?C.co:CC[i%CC.length];
        return (
          <div key={d.s} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:80,fontSize:11,color:C.g3,textAlign:"right",flexShrink:0}}>{d.s}</div>
            <div style={{flex:1}}>
              <div style={{width:Math.max(w,3)+"%",height:32,background:"linear-gradient(90deg,"+color+","+color+"88)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"}}>
                <span style={{fontSize:12,fontWeight:700,color:C.wh}}>{d.c}</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.8)"}}>{d.p}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BkPopup({custs,onClose}) {
  if (!custs || !custs.length) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={function(e){e.stopPropagation()}} style={{background:C.db,borderRadius:16,padding:22,maxWidth:420,width:"90%",maxHeight:"70vh",overflow:"auto",border:"1px solid "+C.el+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,color:C.wh}}>{"Booked Customers ("+custs.length+")"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18} color={C.g4}/></button>
        </div>
        {custs.map(function(c,i) {
          return (
            <div key={i} style={{padding:"9px 12px",background:C.nv,borderRadius:9,marginBottom:5,display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:C.el+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.el,flexShrink:0}}>{c.charAt(0)}</div>
              <span style={{color:C.wh,fontSize:12}}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestMgr({tests,setTests,allN}) {
  var [show,setShow] = useState(false);
  var [form,setForm] = useState({an:"",cn:"",dt:"",nt:"",ss:null});
  var [vss,setVss] = useState(null);
  var fr = useRef();
  var inp = {width:"100%",padding:"9px",borderRadius:7,background:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:12,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:17,fontWeight:800,color:C.wh}}>Testimonials</div>
        <button onClick={function(){setShow(!show)}} style={{padding:"9px 18px",borderRadius:9,background:C.el,color:C.nv,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:5}}><Plus size={14}/>Add</button>
      </div>
      {show && (
        <div style={{background:C.db,borderRadius:14,padding:20,border:"1px solid "+C.el+"30",marginBottom:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:9,color:C.g4,display:"block",marginBottom:3}}>Person *</label><select value={form.an} onChange={function(e){setForm(Object.assign({},form,{an:e.target.value}))}} style={inp}><option value="">Select...</option>{allN.map(function(n){return <option key={n} value={n}>{n}</option>})}</select></div>
            <div><label style={{fontSize:9,color:C.g4,display:"block",marginBottom:3}}>Client *</label><input value={form.cn} onChange={function(e){setForm(Object.assign({},form,{cn:e.target.value}))}} style={inp}/></div>
          </div>
          <div style={{marginBottom:14}}><label style={{fontSize:9,color:C.g4,display:"block",marginBottom:3}}>Screenshot</label><div onClick={function(){if(fr.current)fr.current.click()}} style={{border:"2px dashed "+(form.ss?C.el:C.g6),borderRadius:10,padding:form.ss?6:"18px",cursor:"pointer",textAlign:"center"}}>{form.ss?<img src={form.ss} alt="" style={{maxWidth:"100%",maxHeight:160,borderRadius:7}}/>:<div><Camera size={22} color={C.g5}/><div style={{fontSize:11,color:C.g4,marginTop:4}}>Upload</div></div>}<input ref={fr} type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setForm(Object.assign({},form,{ss:ev.target.result}))};r.readAsDataURL(f)}}/></div></div>
          <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}><button onClick={function(){setShow(false)}} style={{padding:"9px 14px",borderRadius:7,background:C.g7,color:C.wh,border:"none",cursor:"pointer",fontSize:12}}>Cancel</button><button disabled={!form.an||!form.cn} onClick={function(){setTests(tests.concat([{id:Date.now(),an:form.an,cn:form.cn,dt:form.dt||new Date().toISOString().slice(0,10),nt:form.nt,ss:form.ss}]));setForm({an:"",cn:"",dt:"",nt:"",ss:null});setShow(false)}} style={{padding:"9px 18px",borderRadius:7,background:form.an&&form.cn?C.el:C.g6,color:C.nv,border:"none",fontWeight:700,fontSize:12,cursor:form.an&&form.cn?"pointer":"not-allowed"}}>Save</button></div>
        </div>
      )}
      {tests.length===0?(<div style={{textAlign:"center",padding:40,background:C.db,borderRadius:14,border:"1px solid "+C.g7}}><Star size={36} color={C.g6}/><div style={{fontSize:14,color:C.g4,marginTop:8}}>No testimonials yet</div></div>):(<div style={{display:"flex",flexDirection:"column",gap:7}}>{tests.map(function(t){return (<div key={t.id} style={{background:C.db,borderRadius:11,padding:"12px 16px",border:"1px solid "+C.go+"20",display:"flex",alignItems:"center",gap:12}}>{t.ss&&<div onClick={function(){setVss(t.ss)}} style={{width:46,height:46,borderRadius:7,overflow:"hidden",cursor:"pointer",flexShrink:0}}><img src={t.ss} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}<div style={{flex:1}}><span style={{fontWeight:700,color:C.wh,fontSize:12}}>{t.an}</span><span style={{color:C.g5,fontSize:10}}> from </span><span style={{color:C.el,fontSize:11}}>{t.cn}</span></div><button onClick={function(){setTests(tests.filter(function(x){return x.id!==t.id}))}} style={{padding:4,borderRadius:5,background:C.co+"15",border:"none",cursor:"pointer"}}><X size={11} color={C.co}/></button></div>)})}</div>)}
      {vss&&<div onClick={function(){setVss(null)}} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.85)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={vss} alt="" style={{maxWidth:"90%",maxHeight:"90%",borderRadius:14}}/></div>}
    </div>
  );
}

function IndivDash({name,deals,allDeals,allM,tests,bkMode}) {
  var lt = allM.find(function(a){return a.name===name}) || {bk:0,td:0,tst:0,avgT:null,cr:"0.0",bkc:[],da:0};
  var td = calcTrend(allDeals || deals, name, bkMode);
  var maxBk = allM.length ? Math.max.apply(null, allM.map(function(p){return p.bk})) : 1;
  var maxTst = allM.length ? Math.max.apply(null, allM.map(function(p){return p.tst || 0})) : 1;
  var myScore = lt.score != null ? lt.score : calcScore(lt.cr, lt.bk, lt.avgT, maxBk, lt.tst, maxTst);
  var lv = gl(myScore);
  var li = LVLS.indexOf(lv);
  var nl = li<LVLS.length-1?LVLS[li+1]:null;
  var myD = deals.filter(function(d){return d.go===name||d.rp===name||d.tp===name});
  var fun = calcFunnel(myD);
  var cur = allM.find(function(a){return a.name===name})||{};
  var sorted = allM.slice().sort(function(a,b){return (b.score||0)-(a.score||0)});
  var rank = sorted.findIndex(function(a){return a.name===name})+1;
  var top = sorted[0];
  var [showBk,setShowBk] = useState(false);
  var badges = [];
  if(cur.bk>=1)badges.push("🎯 First Blood");
  if(cur.bk>=3)badges.push("🎩 Hat Trick");
  if(cur.sv>=10)badges.push("🏗️ SV Pro");
  if(lt.td>=100)badges.push("💯 Century");
  if(sorted[0]&&sorted[0].name===name)badges.push("👑 #1");

  return (
    <div>
      <div style={{background:"linear-gradient(135deg,"+C.db+","+C.nv+","+lv.c+"15)",borderRadius:14,padding:"16px 14px",marginBottom:18,border:"1px solid "+lv.c+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
              <span style={{fontSize:34}}>{lv.i}</span>
              <div>
                <div style={{fontSize:18,fontWeight:800,color:C.wh}}>{name}</div>
                <div style={{fontSize:11,color:lv.c,fontWeight:700}}>{lv.n+" • #"+rank+" of "+allM.length}</div>
              </div>
            </div>
            <div style={{marginTop:8}}>
              {nl&&<div style={{fontSize:9,color:C.g4,marginBottom:3}}>{(nl.m-myScore)+" pts to "+nl.n+" "+nl.i}</div>}
              <div style={{position:"relative",width:180,height:8,background:C.g7,borderRadius:4}}>
                <div style={{width:Math.min((myScore/100)*100,100)+"%",height:"100%",background:"linear-gradient(90deg,"+LVLS[0].c+","+lv.c+")",borderRadius:4}}/>
                {LVLS.map(function(lvl,i){if(i===0)return null;return <div key={lvl.n} style={{position:"absolute",top:-2,left:(lvl.m)+"%",width:1,height:12,background:lvl.c+"60"}}/>})}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",width:180,marginTop:2}}>
                {LVLS.map(function(lvl){return <span key={lvl.n} style={{fontSize:7,color:myScore>=lvl.m?lvl.c:C.g6}}>{lvl.i}</span>})}
              </div>
            </div>
          </div>
          {rank<=3&&<RB rank={rank}/>}
        </div>
      </div>
      {rank>1&&top&&<div style={{background:"linear-gradient(135deg,"+C.go+"10,"+C.db+")",border:"1px solid "+C.go+"30",borderRadius:12,padding:"14px 18px",marginBottom:14}}><Target size={14} color={C.go} style={{display:"inline",marginRight:5}}/><span style={{fontSize:12,fontWeight:700,color:C.go}}>Reach #1: </span><span style={{fontSize:11,color:C.g3}}>Score gap: {Math.max(0,(top.score||0)-(cur.score||0))} pts behind {top.name}. Boost conversion, bookings, TAT or testimonials to overtake!</span></div>}
      {badges.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>{badges.map(function(b,i){return <div key={i} style={{padding:"5px 10px",background:C.go+"10",border:"1px solid "+C.go+"25",borderRadius:14,fontSize:10,color:C.go,fontWeight:600}}>{b}</div>})}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:7,marginBottom:14}}>
        <MC icon={Award} label="Bookings" value={lt.bk} color={C.el} small/>
        <MC icon={Users} label="Deals" value={lt.td} color={C.sk} small/>
        <MC icon={TrendingUp} label="Conv" value={lt.cr+"%"} color={convColor(lt.cr).c} small/>
        <MC icon={Clock} label="Avg TAT" value={lt.avgT||0} subtitle={lt.avgT?"days":"N/A"} color={C.am} small/>
        <MC icon={Star} label="Testimonials" value={lt.tst} color={C.go} small/>
      </div>
      {/* Personalized Recommendations */}
      <div style={{background:C.db,borderRadius:14,padding:18,border:"1px solid "+C.pu+"25",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:C.wh,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16}}>💡</span> Personalized Recommendations
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {(function(){
            var recs = [];
            var crVal = parseFloat(lt.cr || 0);
            var bkVal = lt.bk || 0;
            var tatVal = lt.avgT;
            var tdVal = lt.td || 0;
            var myDeals = deals.filter(function(d){return d.go===name||d.rp===name||d.tp===name});
            var liveCount = myDeals.filter(function(d){return d.st==="Live"}).length;
            var discCount = myDeals.filter(function(d){return d.dd}).length;
            var svCount = myDeals.filter(function(d){return d.svd}).length;
            var dropCount = myDeals.filter(function(d){return d.st==="Dropped"||d.st==="On Hold"}).length;
            var discRate = tdVal > 0 ? (discCount/tdVal*100) : 0;
            var svRate = discCount > 0 ? (svCount/discCount*100) : 0;
            var bkRate = svCount > 0 ? (bkVal/svCount*100) : 0;

            // Conversion recommendations
            if (crVal < 10) {
              recs.push({icon:"🔴",title:"Conversion needs urgent attention",text:"At "+lt.cr+"%, focus on qualifying leads better during discovery calls. Aim for 15%+ by filtering out low-intent clients early.",pri:"high"});
            } else if (crVal < 15) {
              recs.push({icon:"🟡",title:"Push conversion to green zone",text:"At "+lt.cr+"%, you are close to 15%. Review your dropped deals for patterns — are clients stalling at shortlist or site visit stage?",pri:"med"});
            } else if (crVal < 20) {
              recs.push({icon:"🟢",title:"Conversion is good — aim for 20%+",text:"At "+lt.cr+"%, strong performance. To break 20%, try scheduling back-to-back site visits to maintain client momentum.",pri:"low"});
            } else {
              recs.push({icon:"⭐",title:"Excellent conversion rate!",text:"At "+lt.cr+"%, you are a conversion leader. Share your approach with the team to help others improve.",pri:"star"});
            }

            // TAT recommendations
            if (tatVal === null) {
              recs.push({icon:"⏳",title:"No bookings yet — focus on closing",text:"You have "+liveCount+" live deals. Prioritize moving your most advanced deals (site visit done) to closure.",pri:"high"});
            } else if (tatVal > 60) {
              recs.push({icon:"🔴",title:"Turnaround time is too high ("+tatVal+" days)",text:"Aim to bring TAT under 45 days. Identify bottlenecks: are deals stuck at shortlist or between site visit and booking?",pri:"high"});
            } else if (tatVal > 30) {
              recs.push({icon:"🟡",title:"TAT can improve ("+tatVal+" days)",text:"Good, but faster closures mean happier clients. Try reducing gap between site visit and booking decision.",pri:"med"});
            } else {
              recs.push({icon:"⚡",title:"Fast closer! ("+tatVal+" days avg)",text:"Your speed is a competitive advantage. Keep this up — fast TAT correlates with higher client satisfaction.",pri:"low"});
            }

            // Funnel-specific recommendations
            if (discRate < 70 && tdVal >= 5) {
              recs.push({icon:"📞",title:"Discovery call gap",text:"Only "+Math.round(discRate)+"% of your deals have discovery calls done. Speed up initial engagement to avoid cold leads.",pri:"med"});
            }
            if (svRate < 40 && discCount >= 5) {
              recs.push({icon:"🏠",title:"Site visit conversion is low",text:"Only "+Math.round(svRate)+"% of discovered leads reach site visit. Sharpen your shortlisting to match client needs better.",pri:"med"});
            }
            if (dropCount > bkVal * 3 && tdVal >= 10) {
              recs.push({icon:"🚨",title:"High drop-off rate",text:dropCount+" dropped/on-hold vs "+bkVal+" bookings. Review why clients are leaving — is it pricing, location mismatch, or follow-up gaps?",pri:"high"});
            }

            // Bookings push
            if (top && top.name !== name && bkVal < top.bk) {
              recs.push({icon:"🎯",title:"Booking target",text:"You need "+(top.bk - bkVal + 1)+" more bookings to reach #1. Focus on your "+liveCount+" live deals, especially those past site visit.",pri:"med"});
            }

            return recs.map(function(r, ri) {
              var bgc = r.pri==="high"?C.co:r.pri==="med"?C.am:r.pri==="star"?C.go:C.el;
              return (
                <div key={ri} style={{display:"flex",gap:10,padding:"10px 12px",background:bgc+"08",borderRadius:10,border:"1px solid "+bgc+"20"}}>
                  <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{r.icon}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.wh,marginBottom:2}}>{r.title}</div>
                    <div style={{fontSize:10,color:C.g3,lineHeight:1.5}}>{r.text}</div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {lt.bkc.length>0&&<div style={{marginBottom:16}}><button onClick={function(){setShowBk(true)}} style={{padding:"9px 16px",borderRadius:9,background:C.el+"12",border:"1px solid "+C.el+"30",color:C.el,cursor:"pointer",fontSize:12,fontWeight:600}}>{"View "+lt.bkc.length+" Booked Customers"}</button></div>}
      {showBk&&<BkPopup custs={lt.bkc} onClose={function(){setShowBk(false)}}/>}
      <div style={{background:C.db,borderRadius:12,padding:16,border:"1px solid "+C.g7,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.wh,marginBottom:12}}>Performance Trend</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:C.el,marginBottom:4}}>Bookings</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={td}><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:7}}/><YAxis tick={{fill:C.g4,fontSize:8}} allowDecimals={false}/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}}/><Bar dataKey="bookings" fill={C.el} name="Bookings" radius={[3,3,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:C.pu,marginBottom:4}}>Conversion %</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={td}><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:7}}/><YAxis tick={{fill:C.g4,fontSize:8}} unit="%"/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}} formatter={function(v){return v+"%"}}/><Line type="monotone" dataKey="conv" stroke={C.pu} strokeWidth={2} dot={{r:3,fill:C.pu}}/></LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:C.am,marginBottom:4}}>Avg TAT (days)</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={td}><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:7}}/><YAxis tick={{fill:C.g4,fontSize:8}}/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}} formatter={function(v){return v+" days"}}/><Bar dataKey="tat" fill={C.am} name="TAT" radius={[3,3,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:C.go,marginBottom:4}}>Testimonials: {lt.tst}</div>
            <div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",background:C.nv,borderRadius:8}}>
              <div style={{textAlign:"center"}}><span style={{fontSize:32}}>{lt.tst>0?"⭐":"📝"}</span><div style={{fontSize:11,color:C.g4,marginTop:4}}>{lt.tst>0?lt.tst+" collected":"Add via Testimonials tab"}</div></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{background:C.db,borderRadius:12,padding:16,border:"1px solid "+C.g7}}>
        <div style={{fontSize:12,fontWeight:700,color:C.wh,marginBottom:8}}>Funnel</div>
        <Funnel data={fun}/>
      </div>
    </div>
  );
}

function DashboardClient({ initialData }: { initialData: { NM: any[], RW: any[] } }) {
  var [deals,setDeals] = useState([]);
  var [view,setView] = useState("team");
  var [sel,setSel] = useState(null);
  var [fm,setFM] = useState("all");
  var [fq,setFQ] = useState("all");
  var [fy,setFY] = useState("all");
  var [ft,setFT] = useState("all");
  var [sortBy,setSortBy] = useState("score");
  var [sortDir,setSortDir] = useState("desc");
  var [sb,setSb] = useState(false);
  var [mounted,setMounted] = useState(false);
  var [tests,setTests] = useState([]);
  var [bkPop,setBkPop] = useState(null);
  var [bkMode,setBkMode] = useState("realtime");
  var [showPts,setShowPts] = useState(false);
  var [theme,setTheme] = useState("dark");
  C = theme === "dark" ? DARK : LIGHT;

  useEffect(function(){
    setMounted(true);
    if(typeof window !== "undefined" && window.innerWidth > 768) {
      setSb(true);
    }

    // Use server-provided data (no API call needed)
    if (initialData) {
      var d = parseData(initialData.NM, initialData.RW);
      setDeals(d);
      var mos = d.map(function(x){return x.mo}).filter(Boolean);
      var sorted = Array.from(new Set(mos)).sort();
      var prev = sorted.length >= 2 ? sorted[sorted.length - 2] : sorted[sorted.length - 1];
      if(prev) setFM(prev);
    }
  }, [initialData]);

  var months = useMemo(function(){return Array.from(new Set(deals.map(function(d){return d.mo}).filter(Boolean))).sort()}, [deals]);
  var quarters = useMemo(function(){
    var qOrder = {AMJ: 1, JAS: 2, OND: 3, JFM: 4};
    return Array.from(new Set(deals.map(function(d){return d.q}).filter(Boolean))).sort(function(a, b){
      var aParts = a.match(/([A-Z]+)'(\d+)/);
      var bParts = b.match(/([A-Z]+)'(\d+)/);
      if (!aParts || !bParts) return 0;
      var aYear = parseInt(aParts[2]);
      var bYear = parseInt(bParts[2]);
      var aQ = qOrder[aParts[1]] || 0;
      var bQ = qOrder[bParts[1]] || 0;
      // For JFM (Q4 of financial year), it belongs to the previous financial year
      var aFY = aQ === 4 ? aYear - 1 : aYear;
      var bFY = bQ === 4 ? bYear - 1 : bYear;
      if (aFY !== bFY) return aFY - bFY;
      return aQ - bQ;
    });
  }, [deals]);
  var currentFYQuarters = useMemo(function(){
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    var fyStart = month >= 4 ? year : year - 1;
    var yearShort = String(fyStart).slice(2);
    var nextYearShort = String(fyStart + 1).slice(2);
    return ["AMJ'" + yearShort, "JAS'" + yearShort, "OND'" + yearShort, "JFM'" + nextYearShort];
  }, []);
  var years = useMemo(function(){return Array.from(new Set(deals.map(function(d){return d.yr}).filter(Boolean))).sort()}, [deals]);
  var met = useMemo(function(){return calcMetrics(deals,fm,fq,fy,tests,bkMode,currentFYQuarters)}, [deals,fm,fq,fy,tests,bkMode,currentFYQuarters]);
  var allN = useMemo(function(){return Array.from(new Set(met.adv.map(function(a){return a.name}).concat(met.ma.map(function(m){return m.name})))).sort()}, [met]);
  var allP = useMemo(function(){
    var c = met.adv.concat(met.ma);
    if(ft==="advisor") c=c.filter(function(x){return x.type==="advisor"});
    if(ft==="market_advisor") c=c.filter(function(x){return x.type==="market_advisor"});
    var mxBk = c.length ? Math.max.apply(null, c.map(function(p){return p.bk})) : 1;
    var mxTst = c.length ? Math.max.apply(null, c.map(function(p){return p.tst || 0})) : 1;
    c.forEach(function(p){ p.score = calcScore(p.cr, p.bk, p.avgT, mxBk, p.tst, mxTst); });
    var effectiveSort = (bkMode === "realtime" && sortBy === "score") ? "bk" : sortBy;
    c.sort(function(a,b){return sortDir==="desc"?(b[effectiveSort]||0)-(a[effectiveSort]||0):(a[effectiveSort]||0)-(b[effectiveSort]||0)});
    return c;
  }, [met,ft,sortBy,sortDir,bkMode]);
  var top3 = useMemo(function(){
    return allP.slice().sort(function(a,b){
      if (bkMode === "realtime") return (b.bk||0)-(a.bk||0);
      return (b.score||0)-(a.score||0);
    }).slice(0,3);
  }, [allP, bkMode]);
  var fd = met.fd;
  var teamFun = useMemo(function(){return calcFunnel(fd)}, [fd]);
  var combos = useMemo(function(){return calcCombos(fd)}, [fd]);
  var teamBk = bkMode==="cohort" ? fd.filter(function(d){return isBk(d.st)}).length : deals.filter(function(d){if(!isBk(d.st)||!d.bm)return false;if(fm&&fm!=="all")return d.bm===fm;if(fq==="currentfy"){if(!currentFYQuarters||!d.bq)return false;for(var i=0;i<currentFYQuarters.length;i++){if(d.bq===currentFYQuarters[i])return true}return false}if(fq&&fq!=="all")return d.bq===fq&&(fy==="all"||d.byr===fy);if(fy&&fy!=="all")return d.byr===fy;return true}).length;
  var maxBk = allP.length ? Math.max.apply(null, allP.map(function(p){return p.bk})) : 1;
  var maxTst = allP.length ? Math.max.apply(null, allP.map(function(p){return p.tst || 0})) : 1;

  function hs(col){if(sortBy===col)setSortDir(sortDir==="desc"?"asc":"desc");else{setSortBy(col);setSortDir("desc")}}
  var navs = [{id:"team",icon:Users,l:"Team"},{id:"individual",icon:User,l:"Individual"},{id:"funnel",icon:Activity,l:"Funnel"},{id:"combos",icon:Zap,l:"Combos"},{id:"trends",icon:TrendingUp,l:"Trends"},{id:"testimonials",icon:Star,l:"Testimonials"}];
  var selSt = {padding:"6px 9px",borderRadius:7,background:C.db,border:"1px solid "+C.g6,color:C.wh,fontSize:11,outline:"none"};
  var titles = {team:"Team Leaderboard",individual:sel||"Select Advisor",funnel:"Funnel",combos:"Winning Combos",trends:"Trends",testimonials:"Testimonials"};

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.nv,fontFamily:"system-ui,sans-serif",color:C.wh}}>
      {bkPop&&<BkPopup custs={bkPop} onClose={function(){setBkPop(null)}}/>}
      <div style={{width:!mounted?180:sb?180:48,background:C.db,borderRight:"1px solid "+C.g7,padding:"10px 0",transition:"width 0.3s",flexShrink:0,overflow:"hidden",position:"relative",zIndex:sb?200:1,height:"auto",boxShadow:"none"}}>
        <div style={{padding:"0 12px",marginBottom:22,display:"flex",alignItems:"center",gap:9}}>
          <button onClick={function(){setSb(!sb)}} style={{background:"none",border:"none",cursor:"pointer"}}><Menu size={18} color={C.el}/></button>
          {sb&&<span style={{fontSize:16,fontWeight:900}}><span style={{color:C.wh}}>PROP</span><span style={{color:C.el}}>SOCH</span></span>}
        </div>
        {navs.map(function(item){
          var act = view===item.id;
          return (
            <button key={item.id} onClick={function(){setView(item.id);if(item.id!=="individual")setSel(null)}} style={{display:"flex",alignItems:"center",gap:9,padding:sb?"8px 12px":"8px 12px",background:act?C.el+"12":"transparent",borderLeft:act?"3px solid "+C.el:"3px solid transparent",borderRight:"none",borderTop:"none",borderBottom:"none",cursor:"pointer",width:"100%"}}>
              <item.icon size={15} color={act?C.el:C.g4}/>
              {sb&&<span style={{fontSize:12,fontWeight:act?600:400,color:act?C.wh:C.g4}}>{item.l}</span>}
            </button>
          );
        })}
        <div style={{borderTop:"1px solid "+C.g7,margin:"12px 0"}}/>
        <a href="/deals-dashboard" style={{display:"flex",alignItems:"center",gap:9,padding:sb?"8px 12px":"8px 12px",background:"transparent",borderLeft:"3px solid transparent",textDecoration:"none",cursor:"pointer",width:"100%"}}>
          <Target size={15} color={C.pu}/>
          {sb&&<span style={{fontSize:12,fontWeight:400,color:C.pu}}>Deals Dashboard</span>}
        </a>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"14px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:900,margin:0}}>{titles[view]}</h1>
            <p style={{fontSize:11,color:C.g4,margin:"2px 0 0"}}>{fd.length+" deals • "+(bkMode==="realtime"?"Real-time":"Cohort")}</p>
          </div>
          {view!=="testimonials"&&<div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={function(){setTheme(theme==="dark"?"light":"dark")}} style={{padding:"5px 10px",fontSize:12,borderRadius:7,border:"1px solid "+C.g6,background:C.db,color:C.g3,cursor:"pointer"}}>{theme==="dark"?"☀️":"🌙"}</button>
            <div style={{display:"flex",borderRadius:7,overflow:"hidden",border:"1px solid "+C.g6}}>
              <button onClick={function(){setBkMode("realtime")}} style={{padding:"5px 10px",fontSize:10,fontWeight:600,border:"none",cursor:"pointer",background:bkMode==="realtime"?C.el:C.db,color:bkMode==="realtime"?(theme==="dark"?DARK.nv:LIGHT.db):C.g4}}>Real-time</button>
              <button onClick={function(){setBkMode("cohort")}} style={{padding:"5px 10px",fontSize:10,fontWeight:600,border:"none",cursor:"pointer",background:bkMode==="cohort"?C.pu:C.db,color:bkMode==="cohort"?C.wh:C.g4}}>Cohort</button>
            </div>
            <select value={fm} onChange={function(e){setFM(e.target.value);if(e.target.value!=="all"){setFQ("all");setFY("all")}}} style={selSt}><option value="all">All Months</option>{months.map(function(m){return <option key={m} value={m}>{ml(m)}</option>})}</select>
            <select value={fq} onChange={function(e){setFQ(e.target.value);if(e.target.value!=="all")setFM("all")}} style={selSt}><option value="all">All Qtrs</option><option value="currentfy">Current FY</option>{quarters.map(function(q){return <option key={q} value={q}>{q}</option>})}</select>
            {view==="team"&&<select value={ft} onChange={function(e){setFT(e.target.value)}} style={selSt}><option value="all">All</option><option value="advisor">Advisors</option><option value="market_advisor">Market Advisors</option></select>}
          </div>}
        </div>

        {view==="team"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:14}}>
              <MC icon={Trophy} label="Bookings" value={teamBk} color={C.el}/>
              <MC icon={BarChart3} label="Deals" value={fd.length} color={C.sk}/>
              <MC icon={TrendingUp} label="Avg Conv" value={(fd.length?(teamBk/fd.length*100).toFixed(1):"0")+"%"} color={C.pu}/>
              <MC icon={Users} label="Team" value={allP.length} color={C.am}/>
            </div>
            <div style={{background:C.db,borderRadius:10,padding:"10px 14px",marginBottom:14,border:"1px solid "+C.pu+"20",cursor:"pointer"}} onClick={function(){setShowPts(!showPts)}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>🏅</span>
                <span style={{fontSize:11,fontWeight:700,color:C.wh}}>How to earn points</span>
                <span style={{fontSize:9,color:C.g5,marginLeft:4}}>25pts each</span>
              </div>
              <span style={{fontSize:9,color:C.pu,fontWeight:600}}>{showPts?"▲ Hide":"▼ Show"}</span>
            </div>
            {!showPts&&<div style={{marginTop:6}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>{[{c:C.el,t:"Close more deals → Conv"},{c:C.sk,t:"Get more bookings"},{c:C.am,t:"Close faster → TAT"},{c:C.go,t:"Collect testimonials"}].map(function(x,i){return <span key={i} style={{fontSize:8,padding:"2px 6px",borderRadius:4,background:x.c+"12",color:x.c,fontWeight:600}}>{x.t}</span>})}</div>
              <div style={{display:"flex",alignItems:"center",gap:2}}>
                {LVLS.map(function(l,i){var isLast=i===LVLS.length-1;return <div key={l.n} style={{display:"flex",alignItems:"center"}}><span style={{fontSize:10}}>{l.i}</span><span style={{fontSize:7,fontWeight:700,color:l.c,marginLeft:1,marginRight:1}}>{l.n}</span>{!isLast&&<span style={{fontSize:8,color:C.g6}}>→</span>}</div>})}
              </div>
            </div>}
            {showPts&&<div style={{marginTop:10}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
                <div style={{background:C.nv,borderRadius:8,padding:"8px 10px",border:"1px solid "+C.el+"20"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:15,fontWeight:900,color:C.el}}>25</span><span style={{fontSize:9,color:C.g4}}>pts max</span></div>
                  <div style={{fontSize:10,fontWeight:700,color:C.wh,marginTop:2}}>🎯 Conversion Rate</div>
                  <div style={{fontSize:9,color:C.g4,marginTop:2,lineHeight:1.4}}>Bookings ÷ Deals. <b style={{color:C.el}}>Action:</b> Qualify leads in discovery, follow up faster, reduce drops.</div>
                  <div style={{fontSize:8,color:C.g5,marginTop:3}}>30%+ conv = full 25 pts</div>
                </div>
                <div style={{background:C.nv,borderRadius:8,padding:"8px 10px",border:"1px solid "+C.sk+"20"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:15,fontWeight:900,color:C.sk}}>25</span><span style={{fontSize:9,color:C.g4}}>pts max</span></div>
                  <div style={{fontSize:10,fontWeight:700,color:C.wh,marginTop:2}}>📊 Bookings Count</div>
                  <div style={{fontSize:9,color:C.g4,marginTop:2,lineHeight:1.4}}>Scored vs. top performer. <b style={{color:C.sk}}>Action:</b> Push live deals to site visit and close.</div>
                  <div style={{fontSize:8,color:C.g5,marginTop:3}}>Match top performer = full 25 pts</div>
                </div>
                <div style={{background:C.nv,borderRadius:8,padding:"8px 10px",border:"1px solid "+C.am+"20"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:15,fontWeight:900,color:C.am}}>25</span><span style={{fontSize:9,color:C.g4}}>pts max</span></div>
                  <div style={{fontSize:10,fontWeight:700,color:C.wh,marginTop:2}}>⚡ Speed (TAT)</div>
                  <div style={{fontSize:9,color:C.g4,marginTop:2,lineHeight:1.4}}>Created → Booked days. <b style={{color:C.am}}>Action:</b> Schedule SVs within 2 weeks, close within 30 days.</div>
                  <div style={{fontSize:8,color:C.g5,marginTop:3}}>0 days = 25 pts, 90+ days = 0 pts</div>
                </div>
                <div style={{background:C.nv,borderRadius:8,padding:"8px 10px",border:"1px solid "+C.go+"20"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:15,fontWeight:900,color:C.go}}>25</span><span style={{fontSize:9,color:C.g4}}>pts max</span></div>
                  <div style={{fontSize:10,fontWeight:700,color:C.wh,marginTop:2}}>⭐ Testimonials</div>
                  <div style={{fontSize:9,color:C.g4,marginTop:2,lineHeight:1.4}}>Client feedback collected. <b style={{color:C.go}}>Action:</b> Ask every booked client for a testimonial.</div>
                  <div style={{fontSize:8,color:C.g5,marginTop:3}}>Match top performer = full 25 pts</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:9,color:C.g5}}>Levels:</span>
                {LVLS.map(function(l){return <span key={l.n} style={{fontSize:8,padding:"2px 5px",borderRadius:4,background:l.c+"15",color:l.c,fontWeight:600}}>{l.i+" "+l.n+" "+l.m+"+"}</span>})}
              </div>
            </div>}
          </div>
          {allP.length>=3&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>{top3.map(function(p,i){var cls=[C.go,"#C0C0C0","#CD7F32"];var lt=p;return(<div key={p.name} onClick={function(){setSel(p.name);setView("individual")}} style={{background:"linear-gradient(135deg,"+cls[i]+"12,"+C.db+")",border:"1px solid "+cls[i]+"35",borderRadius:16,padding:"18px 14px",textAlign:"center",cursor:"pointer"}}><RB rank={i+1}/><div style={{fontSize:15,fontWeight:800,color:C.wh,marginTop:6}}>{p.name}</div><div style={{fontSize:9,color:cls[i],fontWeight:600,textTransform:"uppercase",marginTop:2}}>{p.type==="market_advisor"?"Market Advisor":"Advisor"}</div><div style={{display:"flex",justifyContent:"center",marginTop:3}}><LvlBadge score={p.score}/></div><div style={{fontSize:10,color:C.g4,marginTop:4}}>Score: {p.score}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:8}}><div style={{background:C.el+"12",borderRadius:7,padding:"5px 3px"}}><div onClick={function(e){e.stopPropagation();if(p.bkc&&p.bkc.length)setBkPop(p.bkc)}} style={{fontSize:16,fontWeight:800,color:C.el,cursor:"pointer"}}>{p.bk}</div><div style={{fontSize:8,color:C.g4}}>Bookings</div></div><div style={{background:C.pu+"12",borderRadius:7,padding:"5px 3px"}}><div style={{fontSize:16,fontWeight:800,color:convColor(p.cr).c}}>{p.cr}%</div><div style={{fontSize:8,color:C.g4}}>Conv</div></div></div></div>)})}</div>}
            <div style={{background:C.db,borderRadius:12,overflow:"hidden",border:"1px solid "+C.g7}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.nv}}>{[{k:"r",l:"#"},{k:"nm",l:"Name"},{k:"score",l:"Score"},{k:"da",l:"Deals"},{k:"live",l:"Live"},{k:"disc",l:"Disc"},{k:"sh",l:"Short"},{k:"sv",l:"SV"},{k:"bk",l:"Book"},{k:"cr",l:"Conv%"},{k:"avgT",l:"TAT"}].map(function(col){var sortable=["r","nm"].indexOf(col.k)<0;return <th key={col.k} onClick={function(){if(sortable)hs(col.k)}} style={{padding:"9px 10px",textAlign:col.k==="nm"?"left":"center",color:sortBy===col.k?C.el:C.g4,fontWeight:600,fontSize:9,textTransform:"uppercase",cursor:sortable?"pointer":"default",borderBottom:"1px solid "+C.g7}}>{col.l}{sortBy===col.k?(sortDir==="desc"?" ↓":" ↑"):""}</th>})}</tr></thead><tbody>{allP.map(function(p,i){var lt=p;return(<tr key={p.name+p.type} onClick={function(){setSel(p.name);setView("individual")}} style={{cursor:"pointer"}} onMouseEnter={function(e){e.currentTarget.style.background=C.el+"12"}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}><td style={{padding:10,textAlign:"center",borderBottom:"1px solid "+C.g7+"10"}}><RB rank={i+1}/></td><td style={{padding:10,borderBottom:"1px solid "+C.g7+"10"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:(p.type==="market_advisor"?C.pu:C.el)+"20",fontSize:11,fontWeight:700,color:p.type==="market_advisor"?C.pu:C.el,flexShrink:0}}>{p.name.charAt(0)}</div><div><div style={{fontWeight:600,color:C.wh,fontSize:12,display:"flex",alignItems:"center",gap:3}}>{p.name}{i===0&&<Crown size={11} color={C.go}/>}{p.bk>=3&&<Flame size={11} color={C.co}/>}</div><div style={{fontSize:8,display:"flex",alignItems:"center",gap:3}}><span style={{color:p.type==="market_advisor"?C.pu:C.el}}>{p.type==="market_advisor"?"MA":"ADV"}</span><LvlBadge score={p.score}/></div></div></div></td><td style={{padding:10,textAlign:"center",borderBottom:"1px solid "+C.g7+"10"}}><span style={{fontSize:13,fontWeight:800,color:C.pu,fontFamily:"monospace"}}>{p.score}</span></td>{["da","live","disc","sh","sv"].map(function(k){return <td key={k} style={{padding:10,textAlign:"center",color:C.g3,borderBottom:"1px solid "+C.g7+"10",fontFamily:"monospace"}}>{p[k]||0}</td>})}<td style={{padding:10,textAlign:"center",borderBottom:"1px solid "+C.g7+"10"}}><span onClick={function(e){e.stopPropagation();if(p.bkc&&p.bkc.length)setBkPop(p.bkc)}} style={{fontSize:13,fontWeight:800,color:p.bk>0?C.el:C.g5,fontFamily:"monospace",cursor:p.bk>0?"pointer":"default",textDecoration:p.bk>0?"underline":"none"}}>{p.bk||0}</span></td><td style={{padding:10,textAlign:"center",borderBottom:"1px solid "+C.g7+"10"}}><span style={{padding:"2px 7px",borderRadius:8,fontSize:10,fontWeight:700,background:convColor(p.cr).bg,color:convColor(p.cr).c,fontFamily:"monospace"}}>{p.cr}%</span></td><td style={{padding:10,textAlign:"center",color:C.g3,borderBottom:"1px solid "+C.g7+"10",fontFamily:"monospace"}}>{p.avgT?p.avgT+"d":"—"}</td></tr>)})}</tbody></table></div></div>
          </div>
        )}

        {view==="individual"&&(!sel?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:9}}>
            {allP.map(function(p){var lt=p;return(<div key={p.name+p.type} onClick={function(){setSel(p.name)}} style={{background:C.db,borderRadius:11,padding:"14px 12px",cursor:"pointer",border:"1px solid "+C.g7,textAlign:"center"}} onMouseEnter={function(e){e.currentTarget.style.borderColor=C.el}} onMouseLeave={function(e){e.currentTarget.style.borderColor=C.g7}}><div style={{width:38,height:38,borderRadius:"50%",margin:"0 auto 6px",background:(p.type==="market_advisor"?C.pu:C.el)+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:p.type==="market_advisor"?C.pu:C.el}}>{p.name.charAt(0)}</div><div style={{fontWeight:700,color:C.wh,fontSize:12}}>{p.name}</div><div style={{fontSize:9,color:p.type==="market_advisor"?C.pu:C.el,marginTop:1}}>{p.type==="market_advisor"?"Market Advisor":"Advisor"}</div></div>)})}
          </div>
        ):(
          <div><button onClick={function(){setSel(null)}} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 11px",borderRadius:7,background:C.db,border:"1px solid "+C.g6,color:C.g3,cursor:"pointer",marginBottom:14,fontSize:11}}><ChevronLeft size={13}/>Back</button><IndivDash name={sel} deals={fd} allDeals={deals} allM={allP} tests={tests} bkMode={bkMode}/></div>
        ))}

        {view==="funnel"&&(
          <div>
            <div style={{background:C.db,borderRadius:12,padding:18,border:"1px solid "+C.g7,marginBottom:18}}><div style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:12}}>Team Funnel</div><Funnel data={teamFun}/></div>
            <div style={{background:C.db,borderRadius:12,padding:18,border:"1px solid "+C.g7}}><div style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:12}}>Per Person</div><ResponsiveContainer width="100%" height={Math.max(allP.length*26,180)}><BarChart data={allP} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis type="number" tick={{fill:C.g4,fontSize:9}}/><YAxis type="category" dataKey="name" tick={{fill:C.g3,fontSize:9}} width={90}/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}}/><Bar dataKey="da" fill={C.sk} name="Deals" barSize={8}/><Bar dataKey="bk" fill={C.el} name="Bookings" barSize={8}/><Legend wrapperStyle={{fontSize:9}}/></BarChart></ResponsiveContainer></div>
          </div>
        )}

        {view==="combos"&&(
          <div>
            {combos.length>0&&<div style={{background:"linear-gradient(135deg,"+C.go+"10,"+C.pu+"08,"+C.db+")",borderRadius:14,padding:"16px 14px",marginBottom:18,border:"1px solid "+C.go+"30",textAlign:"center"}}><div style={{fontSize:34}}>⚡</div><div style={{fontSize:10,color:C.go,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:5}}>Power Duo</div><div style={{fontSize:22,fontWeight:900,color:C.wh}}>{combos[0].a+" & "+combos[0].m}</div><div style={{display:"flex",justifyContent:"center",gap:24,marginTop:12}}><div><div style={{fontSize:26,fontWeight:800,color:C.el,fontFamily:"monospace"}}>{combos[0].b}</div><div style={{fontSize:9,color:C.g4}}>Bookings</div></div><div><div style={{fontSize:26,fontWeight:800,color:C.pu,fontFamily:"monospace"}}>{combos[0].r}%</div><div style={{fontSize:9,color:C.g4}}>Conv</div></div><div><div style={{fontSize:26,fontWeight:800,color:C.sk,fontFamily:"monospace"}}>{combos[0].d}</div><div style={{fontSize:9,color:C.g4}}>Deals</div></div></div></div>}
            <div style={{background:C.db,borderRadius:12,overflow:"hidden",border:"1px solid "+C.g7}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.nv}}>{["#","Advisor","Market Advisor","Deals","Book","Conv%"].map(function(h,i){return <th key={i} style={{padding:"9px 12px",textAlign:i<3?"left":"center",color:C.g4,fontWeight:600,fontSize:9}}>{h}</th>})}</tr></thead><tbody>{combos.slice(0,20).map(function(c,i){return(<tr key={i}><td style={{padding:"9px 12px"}}>{i<3?<RB rank={i+1}/>:<span style={{color:C.g5,fontSize:10}}>{i+1}</span>}</td><td style={{padding:"9px 12px",color:C.wh,fontWeight:600}}>{c.a}</td><td style={{padding:"9px 12px",color:C.pu}}>{c.m}</td><td style={{padding:"9px 12px",textAlign:"center",color:C.g3,fontFamily:"monospace"}}>{c.d}</td><td style={{padding:"9px 12px",textAlign:"center",fontWeight:700,color:C.el,fontFamily:"monospace"}}>{c.b}</td><td style={{padding:"9px 12px",textAlign:"center"}}><span style={{padding:"2px 7px",borderRadius:8,fontSize:10,fontWeight:700,background:convColor(c.r).bg,color:convColor(c.r).c}}>{c.r}%</span></td></tr>)})}</tbody></table></div>
          </div>
        )}

        {view==="trends"&&(function(){
          var trendData = months.map(function(m){
            var mDeals = deals.filter(function(d){return d.mo===m});
            var mBk = bkMode==="cohort" ? mDeals.filter(function(d){return isBk(d.st)}).length : deals.filter(function(d){return d.bm===m}).length;
            var mTot = mDeals.length;
            var conv = mTot > 0 ? parseFloat((mBk/mTot*100).toFixed(1)) : 0;
            var tats = [];
            var bkDeals = bkMode==="cohort" ? mDeals.filter(function(d){return isBk(d.st)}) : deals.filter(function(d){return d.bm===m});
            bkDeals.forEach(function(d){var t=dbt(d.cd,d.bd);if(t&&t>0)tats.push(t)});
            var avgTat = tats.length ? Math.round(tats.reduce(function(a,b){return a+b},0)/tats.length) : 0;
            var tst = (tests||[]).filter(function(t){return true}).length > 0 ? 0 : 0; // testimonials don't have monthly data yet
            return {month:ml(m),bookings:mBk,conv:conv,tat:avgTat};
          });
          return (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
              <div style={{background:C.db,borderRadius:12,padding:18,border:"1px solid "+C.g7}}>
                <div style={{fontSize:13,fontWeight:700,color:C.el,marginBottom:10}}>📈 Bookings Over Time</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:8}}/><YAxis tick={{fill:C.g4,fontSize:9}}/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}}/><Bar dataKey="bookings" fill={C.el} name="Bookings" radius={[4,4,0,0]}/></BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:C.db,borderRadius:12,padding:18,border:"1px solid "+C.g7}}>
                <div style={{fontSize:13,fontWeight:700,color:C.pu,marginBottom:10}}>🎯 Conversion % Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:8}}/><YAxis tick={{fill:C.g4,fontSize:9}} unit="%"/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}} formatter={function(v){return v+"%"}}/><Line type="monotone" dataKey="conv" stroke={C.pu} strokeWidth={2.5} name="Conversion %" dot={{r:4,fill:C.pu}}/></LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
              <div style={{background:C.db,borderRadius:12,padding:18,border:"1px solid "+C.g7}}>
                <div style={{fontSize:13,fontWeight:700,color:C.am,marginBottom:10}}>⚡ Avg TAT (days) Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:8}}/><YAxis tick={{fill:C.g4,fontSize:9}}/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}} formatter={function(v){return v+" days"}}/><Bar dataKey="tat" fill={C.am} name="Avg TAT (days)" radius={[4,4,0,0]}/></BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:C.db,borderRadius:12,padding:18,border:"1px solid "+C.g7}}>
                <div style={{fontSize:13,fontWeight:700,color:C.go,marginBottom:10}}>⭐ Testimonials</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={months.map(function(m){return{month:ml(m),testimonials:(tests||[]).filter(function(t){var td=t.dt||"";return td.slice(0,7)===m}).length}})}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.g7}/><XAxis dataKey="month" tick={{fill:C.g4,fontSize:8}}/><YAxis tick={{fill:C.g4,fontSize:9}} allowDecimals={false}/><Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g7,borderRadius:7,color:C.wh,fontSize:10}}/><Bar dataKey="testimonials" fill={C.go} name="Testimonials" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          );
        })()}

        {view==="testimonials"&&<TestMgr tests={tests} setTests={setTests} allN={allN}/>}
      </div>
      <style>{"*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:"+C.nv+"}::-webkit-scrollbar-thumb{background:"+C.g6+";border-radius:2px}select option{background:"+C.nv+";color:"+C.wh+"}body{background:"+C.nv+"}"}</style>
    </div>
  );
}

export default DashboardClient;
