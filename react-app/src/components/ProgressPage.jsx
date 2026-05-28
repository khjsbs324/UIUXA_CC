import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { STUDENTS, TASKS, createEmptyProgress } from '../constants.js';

function clampPercent(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function getStudentAverage(progressData, student) {
  const taskValues = TASKS.map((task) => clampPercent(progressData?.[student]?.[task] ?? 0));
  const sum = taskValues.reduce((total, value) => total + value, 0);
  return Math.round(sum / taskValues.length);
}

export default function ProgressPage({ dashboardState, onSave }) {
  const progressData = dashboardState.progressData || createEmptyProgress();
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0]);
  const [draft, setDraft] = useState(progressData[selectedStudent] || {});

  useEffect(() => {
    setDraft(progressData[selectedStudent] || {});
  }, [progressData, selectedStudent]);

  const overallAverage = useMemo(() => {
    const averages = STUDENTS.map((student) => getStudentAverage(progressData, student));
    const sum = averages.reduce((total, value) => total + value, 0);
    return Math.round(sum / averages.length);
  }, [progressData]);

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setDraft(progressData[student] || {});
  };

  const updateTask = (task, value) => {
    setDraft((current) => ({
      ...current,
      [task]: clampPercent(value)
    }));
  };

  const saveProgress = async () => {
    await onSave({
      ...dashboardState,
      progressData: {
        ...progressData,
        [selectedStudent]: {
          ...progressData[selectedStudent],
          ...draft
        }
      }
    });
  };

  return (
    <section className="page-grid progress-layout">
      <div className="panel student-list">
        <div className="summary">
          <span>전체 평균 진척도</span>
          <strong>{overallAverage}%</strong>
          <div className="progress-bar">
            <i style={{ width: `${overallAverage}%` }} />
          </div>
        </div>

        {STUDENTS.map((student) => {
          const average = getStudentAverage(progressData, student);
          return (
            <button
              className={`student-button ${student === selectedStudent ? 'is-active' : ''}`}
              key={student}
              onClick={() => selectStudent(student)}
              type="button"
            >
              <span>{student}</span>
              <strong>{average}%</strong>
            </button>
          );
        })}
      </div>

      <div className="panel progress-editor">
        <header>
          <div>
            <p>학생 진척도 수정</p>
            <h2>{selectedStudent}</h2>
          </div>
          <button className="primary-button" onClick={saveProgress} type="button">
            <Save size={16} />
            저장
          </button>
        </header>

        <div className="task-grid">
          {TASKS.map((task) => {
            const value = clampPercent(draft[task] ?? progressData[selectedStudent]?.[task] ?? 0);
            return (
              <label className="task-input" key={task}>
                <span>{task}</span>
                <input
                  max="100"
                  min="0"
                  onChange={(event) => updateTask(task, event.target.value)}
                  type="number"
                  value={value}
                />
                <div className="progress-bar">
                  <i style={{ width: `${value}%` }} />
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
