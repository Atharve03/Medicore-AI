import { useCallback, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Sparkles, BrainCircuit, Coins, Gauge, MessageSquareText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { analyticsApi } from '../../api/analytics.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);
const ALL = ['overview','appointments','patients','doctors','billing','pharmacy','laboratory','admissions','departments'];
const SECTIONS = { superAdmin: ALL, admin: ALL, doctor:['appointments'], receptionist:['appointments','patients'], nurse:['admissions'], pharmacist:['pharmacy'], labTechnician:['laboratory'] };
const RANGES = [['today','Today'],['yesterday','Yesterday'],['last7Days','Last 7 days'],['last30Days','Last 30 days'],['thisMonth','This month'],['lastMonth','Last month']];
const COLORS = ['#0284c7','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

export default function AnalyticsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const allowed = SECTIONS[role] || [];
  const [section, setSection] = useState(allowed[0]);
  const [range, setRange] = useState('last30Days');
  const fetcher = useCallback(() => analyticsApi.get(section, { range }), [section, range]);
  const { data, loading, error } = useFetch(fetcher, [fetcher]);
  return <div className="flex flex-col gap-6">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="font-display text-2xl font-semibold">Analytics & Insights</h2><p className="text-sm text-ink-light/60 dark:text-ink-dark/60">Live role-scoped operational trends from hospital records.</p></div>
      <div className="flex gap-2"><select value={section} onChange={(e)=>setSection(e.target.value)} className="rounded-lg border bg-white px-3 py-2 capitalize dark:bg-clinical-900">{allowed.map((x)=><option key={x}>{x}</option>)}</select><select value={range} onChange={(e)=>setRange(e.target.value)} className="rounded-lg border bg-white px-3 py-2 dark:bg-clinical-900">{RANGES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    </header>
    {role === 'superAdmin' && <SuperAdminAiPanel range={range} />}
    {loading && <p className="text-sm text-ink-light/60">Loading analytics…</p>}
    {error && <Card><p className="text-critical-500">{error}</p></Card>}
    {data && <AnalyticsContent section={section} data={data} />}
  </div>;
}

function SuperAdminAiPanel({ range }) {
  const fetcher = useCallback(() => analyticsApi.usage({ range }), [range]);
  const { data, loading } = useFetch(fetcher, [fetcher]);
  const [report, setReport] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function generate() { setBusy(true); setError(''); try { const response = await analyticsApi.report(range); setReport(response.data.data.reply); } catch (err) { setError(err?.response?.data?.message || 'Unable to generate report.'); } finally { setBusy(false); } }
  return <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
    <Card title="AI governance & usage"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric icon={MessageSquareText} label="Requests" value={loading?'—':data?.requests||0}/><Metric icon={BrainCircuit} label="Tokens" value={loading?'—':(data?.totalTokens||0).toLocaleString()}/><Metric icon={Gauge} label="Failed" value={loading?'—':data?.failed||0}/><Metric icon={Coins} label="AI API cost" value={loading?'—':`₹${(data?.cost||0).toFixed(2)}`} note="Ollama runs locally"/></div>{data?.trend?.length>0&&<div className="mt-5 h-52"><Line options={{responsive:true,maintainAspectRatio:false}} data={{labels:data.trend.map(x=>x.date),datasets:[{label:'AI tokens',data:data.trend.map(x=>x.tokens),borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,.15)',fill:true,tension:.3}]}}/></div>}</Card>
    <Card title="AI analytics report" action={<button onClick={generate} disabled={busy} className="flex items-center gap-2 rounded-lg bg-clinical-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Sparkles className="h-4 w-4"/>{busy?'Analyzing…':'Generate report'}</button>}><p className="whitespace-pre-wrap text-sm leading-6 text-ink-light/75 dark:text-ink-dark/75">{report||'Generate a Qwen summary grounded in authorized hospital analytics.'}</p>{error&&<p className="mt-2 text-sm text-critical-500">{error}</p>}</Card>
  </section>;
}

function Metric({icon:Icon,label,value,note}) { return <div className="rounded-xl bg-clinical-50 p-3 dark:bg-clinical-800"><Icon className="mb-2 h-4 w-4 text-clinical-600"/><p className="font-data text-xl font-semibold">{value}</p><p className="text-xs text-ink-light/60">{label}</p>{note&&<p className="mt-1 text-[10px] text-vital-500">{note}</p>}</div>; }

function AnalyticsContent({ section, data }) {
  const metrics = Object.entries(data).filter(([key,value]) => key !== 'period' && typeof value === 'number');
  const trend = data.trend || data.registrationTrend;
  let distribution = data.byStatus || data.byType || data.byGender || data.byWard || data.usersByRole;
  if ((!distribution || !distribution.length) && data.appointmentsByStatus) distribution = Object.entries(data.appointmentsByStatus).map(([label,count])=>({label,count}));
  return <><div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{metrics.map(([key,value])=><Card key={key}><p className="font-data text-2xl font-semibold">{value.toLocaleString()}</p><p className="mt-1 text-xs capitalize text-ink-light/60">{key.replace(/([A-Z])/g,' $1')}</p></Card>)}</div><div className="grid gap-4 lg:grid-cols-2">{trend?.length>0&&<Card title={`${section} activity over time`}><div className="h-72"><Line options={{responsive:true,maintainAspectRatio:false}} data={{labels:trend.map(x=>x.date),datasets:[{label:'Count',data:trend.map(x=>x.count),borderColor:COLORS[0],backgroundColor:'rgba(2,132,199,.15)',fill:true,tension:.3}]}}/></div></Card>}{distribution?.length>0&&<Card title={`${section} distribution`}><div className="mx-auto h-72 max-w-md"><Doughnut options={{responsive:true,maintainAspectRatio:false}} data={{labels:distribution.map(x=>x.label),datasets:[{data:distribution.map(x=>x.count),backgroundColor:COLORS}]}}/></div></Card>}{data.items?.length>0&&<Card title="Operational breakdown"><div className="h-72"><Bar options={{responsive:true,maintainAspectRatio:false}} data={{labels:data.items.map(x=>x.department||x.doctor),datasets:[{label:'Appointments',data:data.items.map(x=>x.appointments||0),backgroundColor:COLORS[0]}]}}/></div></Card>}</div>{!trend?.length&&!distribution?.length&&!data.items?.length&&<Card><p className="text-sm text-ink-light/60">No chart data exists for this period.</p></Card>}</>;
}
