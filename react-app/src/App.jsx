import { ClipboardList, Gauge, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BoardPage from './components/BoardPage.jsx';
import ProgressPage from './components/ProgressPage.jsx';
import { createDefaultState } from './constants.js';
import { loadDashboardState, saveDashboardState } from './services/dashboardApi.js';

const tabs = [
  { id: 'board', label: '수업 게시판', icon: ClipboardList },
  { id: 'progress', label: '진척도', icon: Gauge }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [dashboardState, setDashboardState] = useState(createDefaultState);
  const [status, setStatus] = useState({ type: 'loading', label: '불러오는 중' });

  useEffect(() => {
    let mounted = true;
    loadDashboardState().then((state) => {
      if (!mounted) return;
      setDashboardState(state);
      setStatus({ type: 'ready', label: '서버 데이터 준비됨' });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const savePublicState = async (nextState) => {
    setDashboardState(nextState);
    setStatus({ type: 'saving', label: '서버 저장 중' });

    try {
      await saveDashboardState(nextState);
      setStatus({ type: 'ready', label: '서버 저장 완료' });
    } catch (error) {
      setStatus({ type: 'error', label: error.message });
    }
  };

  const activeTabConfig = useMemo(
    () => tabs.find((tab) => tab.id === activeTab),
    [activeTab]
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>UIUX A</strong>
            <span>React preview</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="주 메뉴">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={`nav-button ${activeTab === tab.id ? 'is-active' : ''}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`save-status ${status.type}`}>
          {status.type === 'saving' || status.type === 'loading' ? (
            <Loader2 size={14} className="spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          <span>{status.label}</span>
        </div>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p>React 전환 1차 범위</p>
            <h1>{activeTabConfig?.label}</h1>
          </div>
        </header>

        {activeTab === 'board' && (
          <BoardPage dashboardState={dashboardState} onSave={savePublicState} />
        )}
        {activeTab === 'progress' && (
          <ProgressPage dashboardState={dashboardState} onSave={savePublicState} />
        )}
      </main>
    </div>
  );
}
