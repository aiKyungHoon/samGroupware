import { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, Users, HeartHandshake, BookOpen, Calculator, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const healthMetrics = [
  { 
    id: 'worship', 
    title: '예배 출석률', 
    icon: Users, 
    status: 'good', 
    score: '87.5%', 
    desc: '지난주 대비 +2.1%', 
    category: 'growing' 
  },
  { 
    id: 'edu_exam', 
    target: 'education',
    title: '인맞은 시험 응시율', 
    icon: BookOpen, 
    status: 'warning', 
    score: '72.4%', 
    desc: '목표치(85%) 대비 미달', 
    category: 'growing'
  },
  { 
    id: 'edu_worship', 
    target: 'education',
    title: '구역예배 실시율', 
    icon: Users, 
    status: 'good', 
    score: '88.1%', 
    desc: '팀별 평균 실시율 양호', 
    category: 'growing'
  },
  { 
    id: 'edu_radio', 
    target: 'education',
    title: '심야라디오 출결', 
    icon: BookOpen, 
    status: 'danger', 
    score: '24.5%', 
    desc: '전년 동기 대비 급감', 
    category: 'growing'
  },
  { 
    id: 'acc_tithe', 
    target: 'accounting',
    title: '십일조 납부율', 
    icon: Calculator, 
    status: 'good', 
    score: '78.5%', 
    desc: '전체 재적 인원 기준', 
    category: 'growing'
  },
  { 
    id: 'acc_fee', 
    target: 'accounting',
    title: '청체비 납부율', 
    icon: Calculator, 
    status: 'good', 
    score: '89.9%', 
    desc: '역대 최고 납부율 달성', 
    category: 'growing'
  },
  { id: 'visits', title: '심방 실시율', icon: HeartHandshake, status: 'good', score: '95.0%', desc: '케어 안정화 단계', category: 'caring' },
  { id: 'evangelism', title: '전도 정착률', icon: TrendingUp, status: 'danger', score: '7.0%', desc: '목료 15% 집중 필요', category: 'caring' },
];

const getStatusColor = (status: string) => {
  if (status === 'good') return 'var(--primary)';
  if (status === 'warning') return '#f59e0b';
  if (status === 'danger') return 'var(--error)';
  return 'var(--secondary)';
};

const getStatusIcon = (status: string) => {
  if (status === 'good') return <CheckCircle2 size={16} color="var(--primary)" />;
  if (status === 'warning') return <AlertTriangle size={16} color="#f59e0b" />;
  if (status === 'danger') return <AlertCircle size={16} color="var(--error)" />;
  return null;
};

interface ChartDataOption {
  label: string;
  barKey: string;
  lineKey: string;
  barName: string;
  lineName: string;
  barColor: string;
  lineColor: string;
  desc: string;
  domain: [number, number];
  data: Array<{ name: string; [key: string]: string | number }>;
}

const correlationDataOptions: Record<string, ChartDataOption> = {
  'visit_worship': {
    label: '심방(원인) ➔ 예배(결과)',
    barKey: '심방횟수',
    lineKey: '예배출석률',
    barName: '월간 심방 횟수 (회)',
    lineName: '예배 출석률 (%)',
    barColor: 'var(--primary)',
    lineColor: '#f59e0b',
    desc: '심방 횟수(막대)의 증감이 이후 예배 출석률(선)에 미치는 영향을 월별로 추적합니다.',
    domain: [60, 100],
    data: [
      { name: '1월', 심방횟수: 12, 예배출석률: 78 },
      { name: '2월', 심방횟수: 18, 예배출석률: 82 },
      { name: '3월', 심방횟수: 25, 예배출석률: 88 },
      { name: '4월', 심방횟수: 7, 예배출석률: 86 }, 
      { name: '5월', 심방횟수: 5, 예배출석률: 79 }, 
      { name: '6월', 심방횟수: 15, 예배출석률: 83 },
      { name: '7월', 심방횟수: 20, 예배출석률: 85 },
      { name: '8월', 심방횟수: 22, 예배출석률: 87.5 },
    ]
  },
  'edu_evangelism': {
    label: '교육(원인) ➔ 전도(결과)',
    barKey: '교육수료자',
    lineKey: '전도정착률',
    barName: '새가족 수료자 (명)',
    lineName: '전도 정착률 (%)',
    barColor: 'var(--tertiary)',
    lineColor: '#0ea5e9',
    desc: '새가족 교육 수료자 수(막대)가 5주 후 전도 정착률(선) 상승에 긍정적인지 평가합니다.',
    domain: [0, 15], 
    data: [
      { name: '1월', 교육수료자: 5, 전도정착률: 4.2 },
      { name: '2월', 교육수료자: 8, 전도정착률: 5.5 },
      { name: '3월', 교육수료자: 12, 전도정착률: 7.8 },
      { name: '4월', 교육수료자: 4, 전도정착률: 5.0 }, 
      { name: '5월', 교육수료자: 9, 전도정착률: 6.2 }, 
      { name: '6월', 교육수료자: 15, 전도정착률: 9.1 },
      { name: '7월', 교육수료자: 11, 전도정착률: 8.5 },
      { name: '8월', 교육수료자: 14, 전도정착률: 9.5 },
    ]
  },
  'visit_account': {
    label: '심방(원인) ➔ 회계(결과)',
    barKey: '심방횟수',
    lineKey: '회계납부율',
    barName: '월간 심방 횟수 (회)',
    lineName: '청체비 납부율 (%)',
    barColor: '#8b5cf6',
    lineColor: '#10b981',
    desc: '심방 등 교구의 정성적 케어 빈도(막대)가 십일조/청체비 참여율(선)로 이어지는지 분석합니다.',
    domain: [50, 90], 
    data: [
      { name: '1월', 심방횟수: 12, 회계납부율: 65 },
      { name: '2월', 심방횟수: 18, 회계납부율: 70 },
      { name: '3월', 심방횟수: 25, 회계납부율: 75 },
      { name: '4월', 심방횟수: 7, 회계납부율: 72 }, 
      { name: '5월', 심방횟수: 5, 회계납부율: 68 }, 
      { name: '6월', 심방횟수: 15, 회계납부율: 74 },
      { name: '7월', 심방횟수: 20, 회계납부율: 76 },
      { name: '8월', 심방횟수: 22, 회계납부율: 78 },
    ]
  }
};

export function Dashboard({ onTabChange }: DashboardProps) {
  const [correlationType, setCorrelationType] = useState('visit_worship');
  const currentChart = correlationDataOptions[correlationType];

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', letterSpacing: '-0.02em', fontWeight: 800 }}>마스터 컨트롤 타워 (Dashboard)</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>교구 사역 현황을 한눈에 파악하고 전략적으로 관리합니다.</p>
        </div>
      </header>

      {/* Categorized Health Indicators */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          
          {/* Group 1: 정량적 성장 지표 */}
          <div style={{ flex: '1 1 500px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }}></span>
              사역 성장 지표 (Growing)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {healthMetrics.filter(m => m.category === 'growing').map((metric) => (
                <MetricCard key={metric.id} metric={metric} onClick={() => onTabChange(metric.target || metric.id)} />
              ))}
            </div>
          </div>

          {/* Group 2: 정성적 돌봄 지표 */}
          <div style={{ flex: '1 1 350px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '14px', background: 'var(--tertiary)', borderRadius: '2px' }}></span>
              성도 돌봄 지표 (Caring)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {healthMetrics.filter(m => m.category === 'caring').map((metric) => (
                <MetricCard key={metric.id} metric={metric} onClick={() => onTabChange(metric.target || metric.id)} />
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Correlation Analysis Chart */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>원인-결과 상관관계 차트</h3>
            <select 
              value={correlationType}
              onChange={(e) => setCorrelationType(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="visit_worship">{correlationDataOptions['visit_worship'].label}</option>
              <option value="edu_evangelism">{correlationDataOptions['edu_evangelism'].label}</option>
              <option value="visit_account">{correlationDataOptions['visit_account'].label}</option>
            </select>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '24px' }}>
            {currentChart.desc}
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentChart.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={12} domain={currentChart.domain} />
                <Tooltip cursor={{ fill: 'var(--surface-low)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey={currentChart.barKey} name={currentChart.barName} fill={currentChart.barColor} radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey={currentChart.lineKey} name={currentChart.lineName} stroke={currentChart.lineColor} strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Alerts & Insights */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>시스템 분석 인사이트</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InsightCard 
              type="danger" 
              title="심야라디오 출결 하락 주의" 
              desc="이번 달 심야라디오 출결 지표가 전월 대비 15% 하락했습니다. 교육 부서의 관심 사역 전환이 요구됩니다." 
            />
            <InsightCard 
              type="warning" 
              title="중점 전도 캠페인 필요" 
              desc="현재 새가족 정착율 7%로 정체 중입니다. 5주 교육 수료 후 신앙 정착을 위한 멘토링 강화가 필요합니다." 
            />
            <InsightCard 
              type="success" 
              title="재정 참여도 안정권" 
              desc="청체비 재적 납부율이 89.9%로 역대 최고치를 기록하고 있습니다. 교구원들의 헌신도가 매우 높습니다." 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ metric, onClick }: { 
  metric: { 
    id: string; 
    title: string; 
    icon: React.ElementType; 
    status: string; 
    score: string; 
    desc: string; 
    target?: string;
  }, 
  onClick: () => void 
}) {
  const Icon = metric.icon;
  const [hover, setHover] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{ 
        background: 'var(--surface-lowest)', 
        padding: '24px', 
        borderRadius: 'var(--radius-lg)', 
        boxShadow: hover ? 'var(--shadow-elevated)' : 'var(--shadow-ambient)',
        borderLeft: `4px solid ${getStatusColor(metric.status)}`,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-4px)' : 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--on-surface)', fontWeight: 700, fontSize: '16px' }}>
          <div style={{ background: 'var(--surface-low)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
            <Icon size={20} color="var(--secondary)" />
          </div>
          {metric.title}
        </div>
        {getStatusIcon(metric.status)}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
        {metric.score}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--secondary)', lineHeight: 1.5, flex: 1 }}>
        {metric.desc}
      </div>
      
      {/* Shortcut Indicator */}
      <div style={{ 
        marginTop: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        fontSize: '12px', 
        color: hover ? 'var(--primary)' : 'transparent',
        fontWeight: 600,
        transition: 'color 0.2s'
      }}>
        상세보기 <ChevronRight size={14} />
      </div>
    </div>
  );
}

function InsightCard({ type, title, desc }: { type: 'danger'|'warning'|'success', title: string, desc: string }) {
  const configs = {
    danger: { bg: '#fee2e2', color: '#991b1b', icon: AlertCircle },
    warning: { bg: '#fef3c7', color: '#92400e', icon: AlertTriangle },
    success: { bg: '#e0e7ff', color: '#3730a3', icon: CheckCircle2 }
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div style={{ display: 'flex', gap: '16px', background: config.bg, padding: '16px', borderRadius: 'var(--radius-md)' }}>
      <div style={{ marginTop: '2px' }}><Icon size={20} color={config.color} /></div>
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: config.color, marginBottom: '6px' }}>{title}</h4>
        <p style={{ fontSize: '13px', color: config.color, opacity: 0.9, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}
