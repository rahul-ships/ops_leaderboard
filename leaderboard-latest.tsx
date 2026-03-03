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
var BDS = ["Booking Done","Invoice Raised","Collection Done","Loyalty Reward","EOI Submitted"];
var SM = {L:"Live",D:"Dropped",H:"On Hold",B:"Booking Done",I:"Invoice Raised",C:"Collection Done",R:"Loyalty Reward",E:"EOI Submitted"};
var QS = ["Every deal you close is a family finding their dream home.","Champions are made from desire, dreams, and vision.","The difference between ordinary and extraordinary is that little extra.","Small daily improvements lead to stunning results."];
var LVLS = [{n:"Rookie",m:0,c:"#94A3B8",i:"🌱",d:"Starting out. Build pipeline & complete discoveries."},{n:"Explorer",m:15,c:"#38BDF8",i:"🧭",d:"Score 15+. Improving conversion & getting first bookings."},{n:"Pro",m:30,c:"#8B5CF6",i:"💎",d:"Score 30+. Solid conversion rate with consistent bookings."},{n:"Expert",m:50,c:"#00E5A0",i:"🏆",d:"Score 50+. High conversion, strong bookings & fast TAT."},{n:"Master",m:70,c:"#FFD700",i:"👑",d:"Score 70+. Top-tier across all 3 metrics."},{n:"Legend",m:85,c:"#FF6B6B",i:"🔥",d:"Score 85+. Elite performer. Best conversion, bookings & TAT."}];
var NM = ["Aamir","Abdul","Hitesh","Rakesh","Prajwal","Rakul","Rashmi","Raunak","Rohan","Samyuktha","Sayantani","Shraddha","Sindhu","Thanvi"];
var RW = [["Devesh Mehta","D",6,-1,4,0,1,2,0,0,"",0,4999],["Prudhvi Teja","B",6,-1,-1,2,3,5,0,13,"2026-01",0,4999],["Saicharan Pulletikurthi","I",6,-1,0,2,3,4,5,149,"2025-08",0,4999],["Abhiram Mishra","H",-1,-1,0,0,2,0,10,0,"",38,4999],["Ram NM","B",6,-1,-1,1,1,15,0,0,"2026-01",0,4999],["Praveen","H",10,-1,-1,1,4,8,34,0,"",0,4999],["Phani Prasad","H",1,-1,0,4,5,0,0,0,"",0,4999],["Anupam Anupam","D",10,-1,0,7,0,0,0,0,"",0,0],["Arvind S Iyer","C",6,-1,0,8,10,15,29,36,"2025-05",34,4999],["Mkv sundar","D",1,-1,0,12,0,0,0,0,"",0,2499],["Debasish Mohapatra","D",10,-1,-1,12,13,15,34,0,"",0,2499],["Anoop Cherian","D",1,-1,-1,11,16,18,0,0,"",0,4999],["Christo Kondoor","B",10,-1,0,14,18,22,61,0,"2026-01",0,2499],["Arshad Shahid","B",6,9,-1,16,17,19,37,85,"2025-06",0,4000],["Shashi Bothra","H",1,-1,-1,14,15,18,0,0,"",0,2499],["Sneh Ratna Choudhary","H",6,-1,-1,18,0,0,0,0,"",0,4999],["Shreyas Achar","D",10,-1,-1,18,-233,25,0,0,"",0,4999],["Rachit Srivastava","B",6,-1,0,19,20,0,37,42,"2026-01",0,4999],["Anish","B",6,-1,-1,19,20,0,29,35,"2026-01",0,2499],["Sajjan Mogra","D",1,13,0,18,32,34,36,0,"",0,2499],["Anand G","B",6,-1,-1,20,22,25,29,32,"2026-01",0,4999],["Devesh","B",6,13,-1,20,23,25,29,31,"2026-01",0,2499],["Deepansh Agarwal","B",6,-1,-1,21,25,48,0,48,"2026-01",0,4999],["Ankit Hurkat","L",2,9,0,22,22,25,27,0,"",33,4999],["Goutham Manjunatha","B",6,-1,0,21,22,0,0,25,"2026-01",0,4999],["Arihant","H",1,-1,-1,21,25,32,62,0,"",0,4999],["Kunal Munjal","H",10,-1,-1,21,23,25,39,0,"",0,4999],["Jayant Jhawar","B",1,-1,0,26,29,32,43,48,"2026-01",0,4999],["Harish Swaminathan","B",-1,-1,0,25,0,0,0,26,"2026-01",0,4999],["Milind Pande","B",6,-1,-1,26,27,31,49,49,"2026-01",49,2499],["Shivaraaman","B",6,-1,0,25,0,0,0,28,"2026-01",0,2499],["Siddhartha B","D",7,-1,-1,25,32,65,0,0,"",0,4999],["Rishabh","D",1,-1,-1,28,29,31,46,0,"",0,4999],["Swathi satish","D",6,13,0,28,29,31,34,0,"",0,2499],["Viru patil","D",-1,13,0,30,35,0,0,0,"",0,4999],["Sriram Thota","B",6,-1,0,29,41,0,0,45,"2026-01",0,2499],["Neha Agarwala","D",6,13,-1,28,32,39,64,0,"",0,4999],["Pranjali Ingole","H",1,-1,0,29,3,34,38,0,"",0,4999],["Priyanka Kshirsagar","H",1,-1,0,29,2,34,0,0,"",0,4999],["Sangitta","H",1,13,0,31,0,0,0,0,"",0,2499],["Srinath","H",10,-1,0,30,0,0,0,0,"",0,4999],["Sakthivel Prabhu","I",10,-1,0,29,31,33,48,50,"2025-08",0,4999],["Akshita","D",1,-1,-1,31,32,34,38,0,"",0,2499],["Shreya Mahajan","D",6,-1,0,32,0,0,0,0,"",0,2499]];

function parseData() {
  var base = new Date(2025, 3, 1);
  return RW.map(function(r, i) {
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
    var bm = r[10] || "";
    var bqi = bm ? parseInt(bm.slice(5, 7)) : 0;
    return {
      id: i, cn: r[0], st: SM[r[1]] || "Live",
      go: r[2] >= 0 ? NM[r[2]] : "", rp: r[3] >= 0 ? NM[r[3]] : "", tp: r[4] >= 0 ? NM[r[4]] : "",
      cd: cd, dd: toDate(r[6]), sd: toDate(r[7]), svd: toDate(r[8]), bd: toDate(r[9]),
      dvd: toDate(r[11]), amt: r[12] || 0,
      mo: mo, q: qi ? "Q" + Math.ceil(qi / 3) : "", yr: cd ? cd.slice(0, 4) : "",
      bm: bm, bq: bqi ? "Q" + Math.ceil(bqi / 3) : "", byr: bm ? bm.slice(0, 4) : ""
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

function calcMetrics(deals, fm, fq, fy, tests, bkMode) {
  var f = deals;
  var fmFilter = fm, fqFilter = fq, fyFilter = fy;
  if (fm && fm !== "all") f = f.filter(function(d) { return d.mo === fm; });
  else if (fq && fq !== "all") f = f.filter(function(d) { return d.q === fq && (fy === "all" || d.yr === fy); });
  else if (fy && fy !== "all") f = f.filter(function(d) { return d.yr === fy; });
  var fSet = new Set(f.map(function(d){return d.id}));
  var am = {}, mm = {};
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
          else if (fqFilter && fqFilter !== "all") bkMatch = d.bq === fqFilter && (fyFilter === "all" || d.byr === fyFilter);
          else if (fyFilter && fyFilter !== "all") bkMatch = d.byr === fyFilter;
        }
        if (bkMatch) { a.bk++; a.bkc.push(d.cn); var t = dbt(d.cd, d.bd); if (t && t > 0) a.tat.push(t); }
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
          else if (fqFilter && fqFilter !== "all") bkMP = d.bq === fqFilter && (fyFilter === "all" || d.byr === fyFilter);
          else if (fyFilter && fyFilter !== "all") bkMP = d.byr === fyFilter;
        }
        if (bkMP) { m.bk++; m.bkc.push(d.cn); }
      }
    }
  });
  Object.values(am).concat(Object.values(mm)).forEach(function(x) {
    x.tst = (tests || []).filter(function(t) { return t.an === x.name; }).length;
    x.cr = x.da > 0 ? ((x.bk / x.da) * 100).toFixed(1) : "0.0";
    x.avgT = x.tat.length ? Math.round(x.tat.reduce(function(a, b) { return a + b; }, 0) / x.tat.length) : null;
  });
  return { adv: Object.values(am), ma: Object.values(mm), fd: f };
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
        {nx?<div style={{width:36,height:3,background:C.g7,borderRadius:2,marginTop:1}}><div style={{width:p+"%",height:"100%",background:l.c,borderRadius:2}}/></div>:<div style={{marginTop:2,fontSize:8,color:C.el,fontWeight:700}}>MAX</div>}
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
          <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}><button onClick={function(){setShow(false)}} style={{padding:"9px 14px",borderRadius:7,background:C.g7,color:C.wh,border:"none",cursor:"pointer",fontSize:12}}>Cancel</button><button disabled={!form.an||!form.cn} onClick={function(){setTests(tests.concat([{id:Date.now(),an:form.an,cn:form.cn,dt:form.dt||new Date().toISOString().slice(0,10),nt:form.nt,ss:form.ss}]));setForm({an:"",cn:"",dt:"",nt:"",ss:null});setShow(false)}} style={{padding:"9px 18px",borderRadius:7,background:C.el,color:C.nv,border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>Add</button></div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
        {tests.map(function(t) {
          return (
            <div key={t.id} onClick={function(){setVss(t)}} style={{background:C.db,borderRadius:12,overflow:"hidden",cursor:"pointer",border:"1px solid "+C.g6,transition:"all 0.2s"}}>
              {t.ss&&<img src={t.ss} alt="" style={{width:"100%",height:140,objectFit:"cover"}}/>}
              <div style={{padding:12}}>
                <div style={{fontSize:11,fontWeight:700,color:C.el}}>{t.an}</div>
                <div style={{fontSize:10,color:C.g4,marginTop:2}}>{t.cn}</div>
              </div>
            </div>
          );
        })}
      </div>
      {vss&&<div onClick={function(){setVss(null)}} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.8)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={function(e){e.stopPropagation()}} style={{maxWidth:"90%",maxHeight:"90%"}}>{vss.ss&&<img src={vss.ss} alt="" style={{maxWidth:"100%",maxHeight:"100%",borderRadius:8}}/>}</div></div>}
    </div>
  );
}

function TeamBoard({deals,tests,bkMode,sortBy,sortDir}) {
  var {adv,ma,fd} = useMemo(function() { return calcMetrics(deals,null,null,null,tests,bkMode); }, [deals,tests,bkMode]);
  var maxBk = useMemo(function() { return Math.max.apply(Math,[0].concat(adv.concat(ma).map(function(x){return x.bk}))); }, [adv,ma]);
  var maxTst = useMemo(function() { return Math.max.apply(Math,[0].concat(adv.concat(ma).map(function(x){return x.tst}))); }, [adv,ma]);
  var scored = useMemo(function() { return adv.concat(ma).map(function(x){var s=calcScore(x.cr,x.bk,x.avgT,maxBk,x.tst,maxTst);return Object.assign({},x,{score:s})}).sort(function(a,b){if(sortBy==="score")return sortDir==="desc"?b.score-a.score:a.score-b.score;if(sortBy==="conv")return sortDir==="desc"?parseFloat(b.cr)-parseFloat(a.cr):parseFloat(a.cr)-parseFloat(b.cr);if(sortBy==="bk")return sortDir==="desc"?b.bk-a.bk:a.bk-b.bk;return sortDir==="desc"?b.da-a.da:a.da-b.da}); }, [adv,ma,sortBy,sortDir,maxBk,maxTst]);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
      {scored.map(function(x,i) {
        return (
          <div key={x.name} style={{background:"linear-gradient(135deg,"+C.db+","+C.nv+")",border:"1px solid "+C.g6,borderRadius:14,padding:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:C.el+"08",borderRadius:"50%",transform:"translate(30%, -30%)"}}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.wh,marginBottom:4}}>{x.name}</div>
                  <div style={{fontSize:10,color:C.g4,textTransform:"uppercase",letterSpacing:0.5}}>{x.type==="advisor"?"ADVISOR":"MARKET ADVISOR"}</div>
                </div>
                <RB rank={i+1}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                <MC icon={Target} label="Conv" value={x.cr} color={convColor(x.cr).c}/>
                <MC icon={Trophy} label="Bk" value={x.bk} color={C.el}/>
                <MC icon={Clock} label="TAT" value={x.avgT?x.avgT+" d":"-"} color={C.am}/>
                <MC icon={Star} label="Tst" value={x.tst} color={C.pu}/>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:C.g4,fontWeight:600,marginBottom:4}}>Overall Score</div>
                <div style={{fontSize:24,fontWeight:800,color:C.wh,marginBottom:8}}>{x.score}</div>
                <LvlBadge score={x.score}/>
              </div>
              <div style={{borderTop:"1px solid "+C.g6,paddingTop:10}}>
                <div style={{fontSize:9,color:C.g4,fontWeight:600,marginBottom:6}}>Pipeline</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <MC icon={Activity} label="DA" value={x.da} small/>
                  <MC icon={Users} label="Disc" value={x.disc} small/>
                  <MC icon={BarChart3} label="SV" value={x.sv} small/>
                  <MC icon={Zap} label="Live" value={x.live} small/>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IndivDash({deal,onClose,deals,tests,bkMode}) {
  var [foc,setFoc] = useState("overview");
  var advs = [deal.go,deal.rp].filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i});
  var {adv,ma} = useMemo(function() { return calcMetrics(deals,null,null,null,tests,bkMode); }, [deals,tests,bkMode]);
  var maxBk = useMemo(function() { return Math.max.apply(Math,[0].concat(adv.concat(ma).map(function(x){return x.bk}))); }, [adv,ma]);
  var maxTst = useMemo(function() { return Math.max.apply(Math,[0].concat(adv.concat(ma).map(function(x){return x.tst}))); }, [adv,ma]);
  var advData = useMemo(function() {
    var allData = adv.concat(ma);
    return advs.map(function(n) {
      var found = allData.find(function(x){return x.name===n});
      return found ? Object.assign({},found,{score:calcScore(found.cr,found.bk,found.avgT,maxBk,found.tst,maxTst)}) : null;
    }).filter(Boolean);
  }, [advs,adv,ma,maxBk,maxTst]);
  var tr = useMemo(function() {
    return advData.length > 0 ? calcTrend(deals,advs[0],bkMode) : [];
  }, [advData,deals,bkMode,advs]);
  return (
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",padding:15}}>
      <div onClick={function(e){e.stopPropagation()}} style={{background:C.db,borderRadius:16,width:"100%",maxWidth:600,maxHeight:"85vh",overflow:"auto",border:"1px solid "+C.g6}}>
        <div style={{background:C.nv,borderBottom:"1px solid "+C.g6,padding:20,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.wh}}>{deal.cn}</div>
            <div style={{fontSize:11,color:C.g4,marginTop:4}}>{deal.st}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><X size={22} color={C.g4}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{display:"flex",gap:10,marginBottom:20,borderBottom:"1px solid "+C.g6,paddingBottom:12}}>
            {["overview","timeline","advisors"].map(function(t) {
              return (
                <button key={t} onClick={function(){setFoc(t)}} style={{padding:"6px 12px",borderRadius:7,background:foc===t?C.el+"30":C.g6,color:foc===t?C.el:C.g4,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>
                  {t}
                </button>
              );
            })}
          </div>
          {foc==="overview"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                <MC icon={Target} label="Status" value={deal.st} color={isBk(deal.st)?C.el:C.g4}/>
                <MC icon={Trophy} label="Amount" value={"₹"+deal.amt.toLocaleString()} color={C.am}/>
              </div>
              {advData.length>0&&(
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.wh,marginBottom:10}}>Advisor Performance</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {advData.map(function(a) {
                      return (
                        <div key={a.name} style={{background:C.nv,borderRadius:10,padding:10,border:"1px solid "+C.g6}}>
                          <div style={{fontSize:11,fontWeight:700,color:C.wh,marginBottom:8}}>{a.name}</div>
                          <MC icon={Target} label="Conv" value={a.cr} color={convColor(a.cr).c} small/>
                          <div style={{marginTop:8}}><MC icon={Trophy} label="Score" value={a.score} color={C.el} small/></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {foc==="timeline"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[{label:"Created",date:deal.cd},{label:"Discovery",date:deal.dd},{label:"Shortlist",date:deal.sd},{label:"Site Visit",date:deal.svd},{label:"Deep Dive",date:deal.dvd},{label:"Booking",date:deal.bd}].map(function(e) {
                var done = !!e.date;
                return (
                  <div key={e.label} style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:done?C.el+"30":C.g6,border:"2px solid "+(done?C.el:C.g5),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {done&&<div style={{width:8,height:8,borderRadius:"50%",background:C.el}}/>}
                    </div>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:C.wh}}>{e.label}</div>
                      <div style={{fontSize:10,color:C.g4,marginTop:2}}>{e.date||"Pending"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {foc==="advisors"&&(
            <div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.g4,textTransform:"uppercase",marginBottom:8}}>Team</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {advs.map(function(a) {
                    return (
                      <div key={a} style={{padding:"6px 12px",borderRadius:20,background:C.el+"20",border:"1px solid "+C.el,color:C.el,fontSize:11,fontWeight:700}}>
                        {a}
                      </div>
                    );
                  })}
                </div>
              </div>
              {deal.tp&&(
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.g4,textTransform:"uppercase",marginBottom:8}}>Market Advisor</div>
                  <div style={{padding:"6px 12px",borderRadius:20,background:C.am+"20",border:"1px solid "+C.am,color:C.am,fontSize:11,fontWeight:700,display:"inline-block"}}>
                    {deal.tp}
                  </div>
                </div>
              )}
              {tr.length>0&&(
                <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid "+C.g6}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.g4,textTransform:"uppercase",marginBottom:10}}>Trend</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={tr}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.g6}/>
                      <XAxis dataKey="month" stroke={C.g4} style={{fontSize:10}}/>
                      <YAxis stroke={C.g4} style={{fontSize:10}}/>
                      <Tooltip contentStyle={{background:C.nv,border:"1px solid "+C.g6,borderRadius:8,color:C.wh,fontSize:11}}/>
                      <Line type="monotone" dataKey="bookings" stroke={C.el} strokeWidth={2} dot={{fill:C.el,r:4}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealsTable({deals,sel,setSel}) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{background:C.nv,borderBottom:"1px solid "+C.g6}}>
            <th style={{padding:"10px 12px",textAlign:"left",color:C.g4,fontWeight:700,fontSize:10}}>Client</th>
            <th style={{padding:"10px 12px",textAlign:"center",color:C.g4,fontWeight:700,fontSize:10}}>Status</th>
            <th style={{padding:"10px 12px",textAlign:"center",color:C.g4,fontWeight:700,fontSize:10}}>TAT</th>
            <th style={{padding:"10px 12px",textAlign:"right",color:C.g4,fontWeight:700,fontSize:10}}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(function(d) {
            var t = dbt(d.cd,d.bd);
            return (
              <tr key={d.id} onClick={function(){setSel(d)}} style={{borderBottom:"1px solid "+C.g6,cursor:"pointer",background:sel?.id===d.id?C.el+"10":"transparent"}}>
                <td style={{padding:"10px 12px",color:C.wh}}>{d.cn}</td>
                <td style={{padding:"10px 12px",textAlign:"center",color:isBk(d.st)?C.el:C.g4}}>{d.st}</td>
                <td style={{padding:"10px 12px",textAlign:"center",color:C.g4}}>{t?t+" d":"-"}</td>
                <td style={{padding:"10px 12px",textAlign:"right",color:C.g3}}>₹{d.amt.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsDash({deals}) {
  var fn = useMemo(function() { return calcFunnel(deals); }, [deals]);
  var cb = useMemo(function() { return calcCombos(deals); }, [deals]);
  var {adv,ma} = useMemo(function() { return calcMetrics(deals,null,null,null,[],null); }, [deals]);
  var avgConv = useMemo(function() {
    var all = adv.concat(ma);
    if (all.length === 0) return 0;
    var sum = all.reduce(function(a,x){return a+parseFloat(x.cr)},0);
    return (sum/all.length).toFixed(1);
  }, [adv,ma]);
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:14}}>Conversion Funnel</div>
        <Funnel data={fn}/>
      </div>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:14}}>Team Insights</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <MC icon={Trophy} label="Avg Conv" value={avgConv} color={C.el}/>
          <MC icon={Users} label="Total Advisors" value={adv.length} color={C.pu}/>
          <MC icon={Star} label="Market Advisors" value={ma.length} color={C.am}/>
          <MC icon={Zap} label="Total Bookings" value={deals.filter(function(d){return isBk(d.st)}).length} color={C.sk}/>
        </div>
      </div>
      {cb.length>0&&(
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:14}}>Top Advisor-MA Combinations</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:C.nv,borderBottom:"1px solid "+C.g6}}>
                  <th style={{padding:"10px 12px",textAlign:"left",color:C.g4,fontWeight:700}}>Advisor</th>
                  <th style={{padding:"10px 12px",textAlign:"left",color:C.g4,fontWeight:700}}>Market Advisor</th>
                  <th style={{padding:"10px 12px",textAlign:"center",color:C.g4,fontWeight:700}}>Deals</th>
                  <th style={{padding:"10px 12px",textAlign:"center",color:C.g4,fontWeight:700}}>Booked</th>
                  <th style={{padding:"10px 12px",textAlign:"center",color:C.g4,fontWeight:700}}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {cb.slice(0,8).map(function(c) {
                  return (
                    <tr key={c.a+c.m} style={{borderBottom:"1px solid "+C.g6}}>
                      <td style={{padding:"10px 12px",color:C.wh}}>{c.a}</td>
                      <td style={{padding:"10px 12px",color:C.wh}}>{c.m}</td>
                      <td style={{padding:"10px 12px",textAlign:"center",color:C.g3}}>{c.d}</td>
                      <td style={{padding:"10px 12px",textAlign:"center",color:C.el,fontWeight:700}}>{c.b}</td>
                      <td style={{padding:"10px 12px",textAlign:"center",color:convColor(c.r).c,fontWeight:700}}>{c.r}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
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
    var d = parseData();
    setDeals(d);
    var mos = d.map(function(x){return x.mo}).filter(Boolean);
    var sorted = Array.from(new Set(mos)).sort();
    var prev = sorted.length >= 2 ? sorted[sorted.length - 2] : sorted[sorted.length - 1];
    if(prev) setFM(prev);
  }, []);

  var fm_opts = useMemo(function() {
    var mos = deals.map(function(x){return x.mo}).filter(Boolean);
    var sorted = Array.from(new Set(mos)).sort();
    return ["all"].concat(sorted);
  }, [deals]);

  var fq_opts = useMemo(function() {
    var qs = deals.map(function(x){return x.q}).filter(Boolean);
    var sorted = Array.from(new Set(qs)).sort();
    return ["all"].concat(sorted);
  }, [deals]);

  var fy_opts = useMemo(function() {
    var yrs = deals.map(function(x){return x.yr}).filter(Boolean);
    var sorted = Array.from(new Set(yrs)).sort();
    return ["all"].concat(sorted);
  }, [deals]);

  var ft_opts = useMemo(function() {
    return ["all","Booking Done","Invoice Raised","Collection Done","Live","On Hold","Dropped"];
  }, []);

  var filtered = useMemo(function() {
    var f = deals;
    if(ft && ft !== "all") f = f.filter(function(d){return d.st === ft});
    if(fm && fm !== "all") f = f.filter(function(d){return d.mo === fm});
    else if(fq && fq !== "all") f = f.filter(function(d){return d.q === fq && (fy === "all" || d.yr === fy)});
    else if(fy && fy !== "all") f = f.filter(function(d){return d.yr === fy});
    return f;
  }, [deals,ft,fm,fq,fy]);

  var {adv,ma,fd} = useMemo(function() { return calcMetrics(deals,fm,fq,fy,tests,bkMode); }, [deals,fm,fq,fy,tests,bkMode]);
  var maxBk = useMemo(function() { return Math.max.apply(Math,[0].concat(adv.concat(ma).map(function(x){return x.bk}))); }, [adv,ma]);
  var maxTst = useMemo(function() { return Math.max.apply(Math,[0].concat(adv.concat(ma).map(function(x){return x.tst}))); }, [adv,ma]);

  var pq = useMemo(function() {
    if(!fm || fm === "all") {
      if(!fq || fq === "all") return deals.map(function(x){return x.mo}).filter(Boolean);
      return deals.filter(function(d){return d.q===fq&&(fy==="all"||d.yr===fy)}).map(function(x){return x.mo}).filter(Boolean);
    }
    return [fm];
  }, [deals,fm,fq,fy]);

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.nv,color:C.wh}}>
      {mounted && (
        <div style={{width:sb?180:48,background:C.db,borderRight:"1px solid "+C.g7,padding:"10px 0",transition:"width 0.3s",flexShrink:0,overflow:"hidden"}}>
          <button onClick={function(){setSb(!sb)}} style={{width:"100%",aspect:"1",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.g3,transition:"all 0.2s"}}><Menu size={22}/></button>
          <div style={{display:"flex",flexDirection:"column",gap:0,marginTop:10}}>
            {["team","deals","analytics","testimonials"].map(function(v) {
              var icons = {team:Trophy,deals:BarChart3,analytics:TrendingUp,testimonials:Star};
              var Icon = icons[v];
              return (
                <button key={v} onClick={function(){setView(v)}} style={{width:"100%",padding:"12px 10px",background:view===v?C.el+"20":"transparent",border:"none",cursor:"pointer",color:view===v?C.el:C.g4,display:"flex",alignItems:"center",gap:sb?10:0,transition:"all 0.2s",justifyContent:sb?"flex-start":"center"}}>
                  <Icon size={20}/>
                  {sb&&<span style={{fontSize:11,fontWeight:700,textTransform:"uppercase"}}>{v}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{padding:20,maxWidth:1600,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
            <div>
              <div style={{fontSize:28,fontWeight:900,color:C.wh,display:"flex",alignItems:"center",gap:8}}>
                <Trophy size={32} color={C.el}/>
                Leaderboard
              </div>
              <div style={{fontSize:13,color:C.g4,marginTop:6}}>Real-time sales performance tracking</div>
            </div>
            <button onClick={function(){setTheme(theme==="dark"?"light":"dark")}} style={{padding:"8px 14px",borderRadius:8,background:C.el+"20",color:C.el,border:"1px solid "+C.el,cursor:"pointer",fontSize:12,fontWeight:700}}>
              {theme.toUpperCase()}
            </button>
          </div>

          {view==="team"&&(
            <div>
              <div style={{background:C.db,borderRadius:12,padding:16,marginBottom:20,border:"1px solid "+C.g6,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
                <div>
                  <label style={{fontSize:9,color:C.g4,display:"block",marginBottom:6,fontWeight:700}}>MONTH</label>
                  <select value={fm} onChange={function(e){setFM(e.target.value);setFQ("all");setFY("all")}} style={{width:"100%",padding:"8px",borderRadius:6,background:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:11,cursor:"pointer"}}>{fm_opts.map(function(o){return <option key={o} value={o}>{o==="all"?"All Months":ml(o)}</option>})}</select>
                </div>
                <div>
                  <label style={{fontSize:9,color:C.g4,display:"block",marginBottom:6,fontWeight:700}}>QUARTER</label>
                  <select value={fq} onChange={function(e){setFQ(e.target.value);setFM("all")}} disabled={fm!=="all"} style={{width:"100%",padding:"8px",borderRadius:6,background:fm!=="all"?C.g5:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:11,cursor:fm!=="all"?"not-allowed":"pointer"}}>{fq_opts.map(function(o){return <option key={o} value={o}>{o==="all"?"All Quarters":o}</option>})}</select>
                </div>
                <div>
                  <label style={{fontSize:9,color:C.g4,display:"block",marginBottom:6,fontWeight:700}}>YEAR</label>
                  <select value={fy} onChange={function(e){setFY(e.target.value)}} disabled={fq==="all"} style={{width:"100%",padding:"8px",borderRadius:6,background:fq==="all"?C.g5:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:11,cursor:fq==="all"?"not-allowed":"pointer"}}>{fy_opts.map(function(o){return <option key={o} value={o}>{o==="all"?"All Years":o}</option>})}</select>
                </div>
                <div>
                  <label style={{fontSize:9,color:C.g4,display:"block",marginBottom:6,fontWeight:700}}>SORT</label>
                  <select value={sortBy} onChange={function(e){setSortBy(e.target.value)}} style={{width:"100%",padding:"8px",borderRadius:6,background:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:11,cursor:"pointer"}}><option value="score">Score</option><option value="conv">Conversion</option><option value="bk">Bookings</option><option value="da">Deals</option></select>
                </div>
              </div>
              <TeamBoard deals={filtered} tests={tests} bkMode={bkMode} sortBy={sortBy} sortDir={sortDir}/>
            </div>
          )}

          {view==="deals"&&(
            <div>
              <div style={{background:C.db,borderRadius:12,padding:16,marginBottom:20,border:"1px solid "+C.g6,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
                <div>
                  <label style={{fontSize:9,color:C.g4,display:"block",marginBottom:6,fontWeight:700}}>STATUS</label>
                  <select value={ft} onChange={function(e){setFT(e.target.value)}} style={{width:"100%",padding:"8px",borderRadius:6,background:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:11,cursor:"pointer"}}>{ft_opts.map(function(o){return <option key={o} value={o}>{o}</option>})}</select>
                </div>
                <div>
                  <label style={{fontSize:9,color:C.g4,display:"block",marginBottom:6,fontWeight:700}}>BOOKING MODE</label>
                  <select value={bkMode} onChange={function(e){setBkMode(e.target.value)}} style={{width:"100%",padding:"8px",borderRadius:6,background:C.nv,border:"1px solid "+C.g6,color:C.wh,fontSize:11,cursor:"pointer"}}><option value="realtime">Realtime</option><option value="cohort">Cohort</option></select>
                </div>
              </div>
              <div style={{background:C.db,borderRadius:12,border:"1px solid "+C.g6,overflow:"hidden"}}>
                <DealsTable deals={filtered} sel={sel} setSel={setSel}/>
              </div>
              {sel&&<IndivDash deal={sel} onClose={function(){setSel(null)}} deals={deals} tests={tests} bkMode={bkMode}/>}
              {bkPop&&<BkPopup custs={bkPop} onClose={function(){setBkPop(null)}}/>}
            </div>
          )}

          {view==="analytics"&&(
            <div>
              <AnalyticsDash deals={filtered}/>
            </div>
          )}

          {view==="testimonials"&&(
            <div style={{background:C.db,borderRadius:12,padding:20,border:"1px solid "+C.g6}}>
              <TestMgr tests={tests} setTests={setTests} allN={NM}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
