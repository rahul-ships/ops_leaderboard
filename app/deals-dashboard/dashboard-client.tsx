"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Deal {
  id: string;
  name: string;
  stage: string;
  ghb_owner: string;
  market_advisor: string;
  priority: string;
  is_converted: boolean;
}

interface DashboardData {
  deals: Deal[];
  expected_bookings: {
    ghb_owner: Record<string, number>;
    market_advisor: Record<string, number>;
    total: number;
  };
}

interface AdvisorCounts {
  live_deals: number;
  live_deals_list: { name: string; stage: string }[];
  bookings: number;
  p0: number; p1a: number; p1b: number; p2: number; p3: number;
  p0_deals: { name: string; stage: string }[];
  p1a_deals: { name: string; stage: string }[];
  p1b_deals: { name: string; stage: string }[];
  p2_deals: { name: string; stage: string }[];
  p3_deals: { name: string; stage: string }[];
  booked_deal_names: string[];
}

function getPriorityCategory(priorityStr: string): string | null {
  if (!priorityStr) return null;
  if (priorityStr.includes("Priority 0")) return "p0";
  if (priorityStr.includes("Priority 1 (A)")) return "p1a";
  if (priorityStr.includes("Priority 1 (B)")) return "p1b";
  if (priorityStr.includes("Priority 2")) return "p2";
  if (priorityStr.includes("Priority 3")) return "p3";
  return null;
}

function emptyAdvisorCounts(): AdvisorCounts {
  return {
    live_deals: 0, live_deals_list: [], bookings: 0,
    p0: 0, p1a: 0, p1b: 0, p2: 0, p3: 0,
    p0_deals: [], p1a_deals: [], p1b_deals: [], p2_deals: [], p3_deals: [],
    booked_deal_names: []
  };
}

export default function DealsDashboardClient({ initialData }: { initialData: DashboardData }) {
  const [bookedDeals, setBookedDeals] = useState<Set<string>>(new Set());
  const [dropdownValue, setDropdownValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDeals, setModalDeals] = useState<{ name: string; stage?: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("ghb_bookings");
    if (stored) setBookedDeals(new Set(JSON.parse(stored)));
  }, []);

  const saveBookings = useCallback((newSet: Set<string>) => {
    localStorage.setItem("ghb_bookings", JSON.stringify(Array.from(newSet)));
    setBookedDeals(newSet);
  }, []);

  const allDeals = initialData.deals;

  const getAdvisorData = useCallback((field: "ghb_owner" | "market_advisor") => {
    const data: Record<string, AdvisorCounts> = {};
    allDeals.forEach((deal) => {
      const key = deal[field] || "Unassigned";
      if (!data[key]) data[key] = emptyAdvisorCounts();
      data[key].live_deals++;
      data[key].live_deals_list.push({ name: deal.name, stage: deal.stage });
      const p = getPriorityCategory(deal.priority);
      if (p) {
        (data[key] as any)[p]++;
        (data[key] as any)[p + "_deals"].push({ name: deal.name, stage: deal.stage });
      }
      if (bookedDeals.has(deal.id)) {
        data[key].bookings++;
        data[key].booked_deal_names.push(deal.name);
      }
    });
    return data;
  }, [allDeals, bookedDeals]);

  const ghbData = useMemo(() => getAdvisorData("ghb_owner"), [getAdvisorData]);
  const advisorData = useMemo(() => getAdvisorData("market_advisor"), [getAdvisorData]);

  const stageData = useMemo(() => {
    const data: Record<string, { site_visit_scheduled: { name: string; stage: string }[]; site_visit_done: { name: string; stage: string }[]; deep_dive_done: { name: string; stage: string }[] }> = {};
    const stageMap: Record<string, string> = { "Site Visit Scheduled": "site_visit_scheduled", "Site Visit Done": "site_visit_done", "Deep Dive Done": "deep_dive_done" };
    allDeals.forEach((deal) => {
      const advisor = deal.market_advisor || "Unassigned";
      if (!data[advisor]) data[advisor] = { site_visit_scheduled: [], site_visit_done: [], deep_dive_done: [] };
      const sk = stageMap[deal.stage];
      if (sk) (data[advisor] as any)[sk].push({ name: deal.name, stage: deal.stage });
    });
    return data;
  }, [allDeals]);

  const teamSummary = useMemo(() => {
    let t = { p0: 0, p1a: 0, p1b: 0, p2: 0, p3: 0 };
    Object.entries(ghbData).filter(([n]) => n !== "Unassigned").forEach(([, c]) => {
      t.p0 += c.p0; t.p1a += c.p1a; t.p1b += c.p1b; t.p2 += c.p2; t.p3 += c.p3;
    });
    const p0e = t.p0 * 0.5, p1ae = t.p1a * 0.2, p1be = t.p1b * 0.35, p2e = t.p2 * 0.15, p3e = t.p3 * 0.1;
    return { p0: p0e, p1a: p1ae, p1b: p1be, p2: p2e, p3: p3e, total: p0e + p1ae + p1be + p2e + p3e };
  }, [ghbData]);

  const handleMarkBooked = () => {
    if (!dropdownValue.trim()) { alert("Please select a client."); return; }
    const deal = allDeals.find((d) => `${d.name} - ${d.stage} - ${d.ghb_owner}` === dropdownValue);
    if (!deal) { alert("Invalid selection."); return; }
    if (bookedDeals.has(deal.id)) { alert("Already booked."); return; }
    const ns = new Set(bookedDeals);
    ns.add(deal.id);
    saveBookings(ns);
    setDropdownValue("");
  };

  const removeBooking = (dealId: string) => {
    const ns = new Set(bookedDeals);
    ns.delete(dealId);
    saveBookings(ns);
  };

  const showDeals = (title: string, deals: { name: string; stage?: string }[]) => {
    if (deals.length === 0) return;
    setModalTitle(title);
    setModalDeals(deals);
    setModalOpen(true);
  };

  const bookedDealsArray = allDeals.filter((d) => bookedDeals.has(d.id));

  // Chart data
  const ghbChartData = useMemo(() => {
    const exp = initialData.expected_bookings.ghb_owner;
    return Object.entries(exp).map(([name, expected]) => ({
      name,
      Expected: +expected.toFixed(2),
      Actual: ghbData[name]?.bookings || 0
    }));
  }, [initialData, ghbData]);

  const advisorChartData = useMemo(() => {
    const exp = initialData.expected_bookings.market_advisor;
    return Object.entries(exp).map(([name, expected]) => ({
      name,
      Expected: +expected.toFixed(2),
      Actual: advisorData[name]?.bookings || 0
    }));
  }, [initialData, advisorData]);

  const teamChartData = useMemo(() => [
    { name: "Team Total", Expected: +initialData.expected_bookings.total.toFixed(2), Actual: bookedDeals.size }
  ], [initialData, bookedDeals.size]);

  function renderAdvisorTable(title: string, data: Record<string, AdvisorCounts>, roleLabel: string) {
    const entries = Object.entries(data).filter(([n]) => n !== "Unassigned").sort(([a], [b]) => a.localeCompare(b));
    const totals = { ld: 0, bk: 0, p0: 0, p1a: 0, p1b: 0, p2: 0, p3: 0 };
    entries.forEach(([, c]) => { totals.ld += c.live_deals; totals.bk += c.bookings; totals.p0 += c.p0; totals.p1a += c.p1a; totals.p1b += c.p1b; totals.p2 += c.p2; totals.p3 += c.p3; });

    return (
      <div style={styles.tableSection}>
        <h2 style={styles.tableTitle}>{title}</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Advisor Name</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Live Deals</th>
                <th style={{ ...styles.th, textAlign: "center", background: "linear-gradient(135deg, #ffa500, #ff8c00)" }}>Bookings</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Priority 0</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Priority 1A</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Priority 1B</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Priority 2</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Priority 3</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([name, c]) => (
                <tr key={name} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#333" }}>{name}</td>
                  <td style={styles.countCell} onClick={() => showDeals(`${name} - Live Deals (${c.live_deals})`, c.live_deals_list)}>{c.live_deals}</td>
                  <td style={{ ...styles.countCell, backgroundColor: "#e8f4f8", fontWeight: 600 }} onClick={() => showDeals(`${name} - Booked Deals (${c.bookings})`, c.booked_deal_names.map(n => ({ name: n })))}>{c.bookings}</td>
                  <td style={c.p0 === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Priority 0 (${c.p0})`, c.p0_deals)}>{c.p0}</td>
                  <td style={c.p1a === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Priority 1A (${c.p1a})`, c.p1a_deals)}>{c.p1a}</td>
                  <td style={c.p1b === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Priority 1B (${c.p1b})`, c.p1b_deals)}>{c.p1b}</td>
                  <td style={c.p2 === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Priority 2 (${c.p2})`, c.p2_deals)}>{c.p2}</td>
                  <td style={c.p3 === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Priority 3 (${c.p3})`, c.p3_deals)}>{c.p3}</td>
                </tr>
              ))}
              <tr style={styles.totalRow}>
                <td style={{ ...styles.td, fontWeight: 700, color: "#333" }}>Total</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.ld}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700, backgroundColor: "#e8f4f8" }}>{totals.bk}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p0}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p1a}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p1b}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p2}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p3}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderForecastTable(title: string, data: Record<string, AdvisorCounts>) {
    const entries = Object.entries(data).filter(([n]) => n !== "Unassigned").sort(([a], [b]) => a.localeCompare(b));
    const totals = { p0: 0, p1a: 0, p1b: 0, p2: 0, p3: 0, total: 0 };
    const rows = entries.map(([name, c]) => {
      const p0e = c.p0 * 0.5, p1ae = c.p1a * 0.2, p1be = c.p1b * 0.35, p2e = c.p2 * 0.15, p3e = c.p3 * 0.1;
      const te = p0e + p1ae + p1be + p2e + p3e;
      totals.p0 += p0e; totals.p1a += p1ae; totals.p1b += p1be; totals.p2 += p2e; totals.p3 += p3e; totals.total += te;
      return { name, p0e, p1ae, p1be, p2e, p3e, te };
    });
    return (
      <div style={styles.tableSection}>
        <h2 style={styles.tableTitle}>{title}</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Advisor Name</th>
                <th style={{ ...styles.th, textAlign: "center" }}>P0 (x0.5)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>P1A (x0.2)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>P1B (x0.35)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>P2 (x0.15)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>P3 (x0.1)</th>
                <th style={{ ...styles.th, textAlign: "center", background: "linear-gradient(135deg, #ffa500, #ff8c00)" }}>Total Expected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{r.name}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{r.p0e.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{r.p1ae.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{r.p1be.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{r.p2e.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{r.p3e.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "center", backgroundColor: "#fff8dc", fontWeight: 700 }}>{r.te.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={styles.totalRow}>
                <td style={{ ...styles.td, fontWeight: 700 }}>Total</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p0.toFixed(2)}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p1a.toFixed(2)}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p1b.toFixed(2)}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p2.toFixed(2)}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 700 }}>{totals.p3.toFixed(2)}</td>
                <td style={{ ...styles.td, textAlign: "center", backgroundColor: "#fff8dc", fontWeight: 700 }}>{totals.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: 20, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30 }}>
          <Link href="/" style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 8, backdropFilter: "blur(10px)" }}>
            <ArrowLeft size={18} /> Back to Leaderboard
          </Link>
          <h1 style={{ color: "white", textAlign: "center", flex: 1, fontSize: "2.2em", textShadow: "2px 2px 4px rgba(0,0,0,0.2)", margin: 0 }}>Enhanced Deals Dashboard</h1>
        </div>

        {/* Team Summary Card */}
        <div style={styles.summaryCard}>
          <h2 style={{ fontSize: "1.8em", marginBottom: 20, textAlign: "center", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>Team Expected Bookings Forecast</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { label: "P0 Expected", value: teamSummary.p0.toFixed(2) },
              { label: "P1A Expected", value: teamSummary.p1a.toFixed(2) },
              { label: "P1B Expected", value: teamSummary.p1b.toFixed(2) },
              { label: "P2 Expected", value: teamSummary.p2.toFixed(2) },
              { label: "P3 Expected", value: teamSummary.p3.toFixed(2) },
              { label: "TOTAL EXPECTED", value: teamSummary.total.toFixed(2), highlight: true },
            ].map((item) => (
              <div key={item.label} style={styles.summaryItem}>
                <div style={{ fontSize: "0.85em", opacity: 0.9, marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: item.highlight ? "2.5em" : "2em", fontWeight: 700, color: item.highlight ? "#ffd700" : "white" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Management */}
        <div style={styles.tableSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ ...styles.tableTitle, marginBottom: 0 }}>Booking Management</h2>
            <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "10px 20px", borderRadius: 8, fontSize: "1.1em", fontWeight: 700 }}>
              {bookedDeals.size} / 150 Deals Booked
            </div>
          </div>
          <div style={{ display: "flex", gap: 15, marginBottom: 20, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 5, color: "#667eea", fontWeight: 600 }}>Select Client to Book</label>
              <input
                list="client-list"
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMarkBooked()}
                placeholder="Search and select a client..."
                style={{ width: "100%", padding: 12, border: "2px solid #667eea", borderRadius: 8, fontSize: 14 }}
              />
              <datalist id="client-list">
                {allDeals.map((d) => (
                  <option key={d.id} value={`${d.name} - ${d.stage} - ${d.ghb_owner}`} />
                ))}
              </datalist>
            </div>
            <button onClick={handleMarkBooked} style={styles.markBookedBtn}>Mark as Booked</button>
          </div>
          {bookedDealsArray.length > 0 ? (
            <div>
              <h3 style={{ color: "#667eea", marginBottom: 12, fontSize: "1.2em" }}>Booked Deals</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Client Name</th>
                      <th style={styles.th}>Stage</th>
                      <th style={styles.th}>GHB Owner</th>
                      <th style={styles.th}>Market Advisor</th>
                      <th style={styles.th}>Priority</th>
                      <th style={{ ...styles.th, width: 100, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookedDealsArray.map((d) => (
                      <tr key={d.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{d.name}</td>
                        <td style={styles.td}>{d.stage}</td>
                        <td style={styles.td}>{d.ghb_owner}</td>
                        <td style={styles.td}>{d.market_advisor}</td>
                        <td style={styles.td}>{d.priority}</td>
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <button onClick={() => removeBooking(d.id)} style={styles.removeBtn}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#999", fontStyle: "italic", padding: 30 }}>
              No deals booked yet. Select a client from the dropdown above.
            </div>
          )}
        </div>

        {/* Tables */}
        {renderAdvisorTable("Table 1: By GHB Deal Owner", ghbData, "GHB Owner")}
        {renderAdvisorTable("Table 2: By Txn. Partner (Market Advisor)", advisorData, "Market Advisor")}

        {/* Stage Table */}
        <div style={styles.tableSection}>
          <h2 style={styles.tableTitle}>Table 3: Stage-Based Analysis by Market Advisor</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Market Advisor</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Site Visit Scheduled</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Site Visit Done</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Deep Dive Done</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stageData).filter(([n]) => n !== "Unassigned").sort(([a], [b]) => a.localeCompare(b)).map(([name, s]) => (
                  <tr key={name} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{name}</td>
                    <td style={s.site_visit_scheduled.length === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Site Visit Scheduled (${s.site_visit_scheduled.length})`, s.site_visit_scheduled)}>{s.site_visit_scheduled.length}</td>
                    <td style={s.site_visit_done.length === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Site Visit Done (${s.site_visit_done.length})`, s.site_visit_done)}>{s.site_visit_done.length}</td>
                    <td style={s.deep_dive_done.length === 0 ? styles.zeroCell : styles.countCell} onClick={() => showDeals(`${name} - Deep Dive Done (${s.deep_dive_done.length})`, s.deep_dive_done)}>{s.deep_dive_done.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div style={styles.tableSection}>
          <h2 style={styles.tableTitle}>Goal vs Actuals - Visual Analytics</h2>
          <h3 style={{ color: "#667eea", textAlign: "center", marginBottom: 16 }}>Team-Level Performance</h3>
          <div style={{ height: 350, marginBottom: 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Expected" fill="rgba(102,126,234,0.8)" />
                <Bar dataKey="Actual" fill="rgba(76,175,80,0.8)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            <div>
              <h3 style={{ color: "#667eea", textAlign: "center", marginBottom: 16 }}>By GHB Deal Owner</h3>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ghbChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Expected" fill="rgba(102,126,234,0.8)" />
                    <Bar dataKey="Actual" fill="rgba(76,175,80,0.8)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 style={{ color: "#667eea", textAlign: "center", marginBottom: 16 }}>By Market Advisor</h3>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advisorChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Expected" fill="rgba(102,126,234,0.8)" />
                    <Bar dataKey="Actual" fill="rgba(76,175,80,0.8)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Tables */}
        {renderForecastTable("Expected Bookings Forecast - By GHB Deal Owner", ghbData)}
        {renderForecastTable("Expected Bookings Forecast - By Market Advisor", advisorData)}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: "1.4em" }}>{modalTitle}</h2>
              <span style={{ color: "white", fontSize: 30, fontWeight: 700, cursor: "pointer", lineHeight: 1 }} onClick={() => setModalOpen(false)}>&times;</span>
            </div>
            <div style={styles.modalBody}>
              {modalDeals.map((deal, i) => (
                <div key={i} style={styles.dealItem}>
                  <div style={{ fontWeight: 600, color: "#333", fontSize: "1.05em", marginBottom: deal.stage ? 4 : 0 }}>{deal.name}</div>
                  {deal.stage && <div style={{ color: "#666", fontSize: "0.9em" }}><strong style={{ color: "#667eea" }}>Stage:</strong> {deal.stage}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tableSection: { background: "white", borderRadius: 15, padding: 25, marginBottom: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  tableTitle: { color: "#667eea", fontSize: "1.6em", marginBottom: 20, paddingBottom: 10, borderBottom: "3px solid #667eea" },
  summaryCard: { background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 15, padding: 30, marginBottom: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", color: "white" },
  summaryItem: { background: "rgba(255,255,255,0.15)", padding: 18, borderRadius: 10, textAlign: "center", backdropFilter: "blur(10px)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "13px 10px", textAlign: "left", fontWeight: 600 },
  td: { padding: "11px 10px", borderBottom: "1px solid #e0e0e0" },
  tr: { transition: "background 0.2s" },
  countCell: { padding: "11px 10px", borderBottom: "1px solid #e0e0e0", textAlign: "center", cursor: "pointer", color: "#667eea", fontWeight: 600, transition: "all 0.3s" },
  zeroCell: { padding: "11px 10px", borderBottom: "1px solid #e0e0e0", textAlign: "center", color: "#ccc" },
  totalRow: { backgroundColor: "#f0f0f0", fontWeight: 700, borderTop: "3px solid #667eea" },
  markBookedBtn: { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "12px 30px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  removeBtn: { background: "#dc3545", color: "white", border: "none", padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 13 },
  modalOverlay: { position: "fixed", zIndex: 1000, left: 0, top: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 15, width: "80%", maxWidth: 800, maxHeight: "80vh", boxShadow: "0 10px 50px rgba(0,0,0,0.5)", overflow: "hidden" },
  modalHeader: { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "18px 25px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalBody: { padding: 25, maxHeight: "calc(80vh - 80px)", overflowY: "auto" },
  dealItem: { padding: 14, marginBottom: 10, background: "#f8f9fa", borderLeft: "4px solid #667eea", borderRadius: 8 },
};
