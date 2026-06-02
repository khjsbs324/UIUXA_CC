(function() {
    const clampPercent = (value) => Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const refreshIcons = () => window.lucide?.createIcons();
    const showToast = (message) => window.showToast?.(message);
    const saveToCloud = () => window.saveToFirebase?.();

    function installProgressView(context) {
        const {
            actionAttrs,
            changeActionAttrs,
            studentsList,
            tasksList,
            studentColors,
            studentColorClass,
            getProgressData,
            getStudentComments,
            getIsEditMode,
            getMyChart,
            setMyChart,
            getCurrentEditingStudent,
            setCurrentEditingStudent
        } = context;

        const normalizeTaskName = (value) => String(value || '').trim();

        const syncProgressShape = () => {
            const progressData = getProgressData();
            studentsList.forEach((student) => {
                if (!progressData[student]) progressData[student] = {};
                tasksList.forEach((task) => {
                    if (progressData[student][task] === undefined) progressData[student][task] = 0;
                });
            });
        };

        const refreshProgressDashboard = () => {
            syncProgressShape();
            window.renderProgressTaskManager?.();
            window.renderChart();
            window.updateSummary();
        };

        const averageForStudent = (student) => {
            const progressData = getProgressData();
            if (tasksList.length === 0) return 0;
            const total = tasksList.reduce((sum, task) => sum + (parseInt(progressData[student]?.[task], 10) || 0), 0);
            return Math.round(total / tasksList.length) || 0;
        };

        window.updateSummary = function() {
            const progressData = getProgressData();
            if (!progressData || tasksList.length === 0) return;

            let total = 0;
            let count = 0;
            studentsList.forEach((student) => {
                tasksList.forEach((task) => {
                    total += parseInt(progressData[student]?.[task], 10) || 0;
                    count++;
                });
            });

            const summary = document.getElementById('summary-avg');
            if (summary) summary.textContent = `${count === 0 ? 0 : Math.round(total / count)}%`;
        };

        window.renderStudentLegend = function() {
            const container = document.getElementById('custom-legend');
            if (!container) return;

            container.innerHTML = '';
            studentsList.forEach((student, index) => {
                const button = document.createElement('button');
                button.id = `legend-btn-${index}`;
                button.className = 'w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 bg-white group';
                button.setAttribute('data-action', 'toggleLegendDataset');
                button.setAttribute('data-action-args', JSON.stringify([index]));

                const commentButton = getIsEditMode()
                    ? `<button ${actionAttrs('openCommentModal', [student], { stop: true })} class="w-7 h-7 flex items-center justify-center bg-indigo-50 hover:bg-indigo-500 hover:text-white rounded-lg text-indigo-400 ml-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i></button>`
                    : '';

                button.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full ${studentColorClass(index)}"></div>
                        <span class="text-[14px] font-bold text-slate-700">${student}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[12px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mr-1">${averageForStudent(student)}%</span>
                        <span ${actionAttrs('openModal', [student], { stop: true })} class="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-figjam hover:text-white rounded-lg text-slate-400"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></span>
                        ${commentButton}
                    </div>
                `;

                container.appendChild(button);
                if (getMyChart()?.isDatasetVisible(index) === false) button.classList.add('opacity-40');
            });
            refreshIcons();
        };

        window.toggleDataset = function(index) {
            const chart = getMyChart();
            if (!chart) return;
            if (chart.isDatasetVisible(index)) chart.hide(index);
            else chart.show(index);
        };

        window.toggleLegendDataset = function(index) {
            window.toggleDataset(index);
            window.updateLegendStyle(index);
        };

        window.updateLegendStyle = function(index) {
            const chart = getMyChart();
            const button = document.getElementById(`legend-btn-${index}`);
            if (!chart || !button) return;
            button.classList.toggle('opacity-40', !chart.isDatasetVisible(index));
        };

        window.renderProgressTaskManager = function() {
            const container = document.getElementById('progress-task-manager');
            if (!container) return;

            if (!getIsEditMode()) {
                container.classList.add('hidden');
                container.innerHTML = '';
                return;
            }

            container.classList.remove('hidden');
            const taskRows = tasksList.map((task, index) => {
                const isDeleteDisabled = tasksList.length <= 1;
                const deleteAttrs = isDeleteDisabled ? 'disabled' : '';
                const deleteClass = isDeleteDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-500 hover:border-red-200';
                return `
                    <div class="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2">
                        <span class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 text-[12px] font-extrabold flex items-center justify-center shrink-0">${index + 1}</span>
                        <input type="text" value="${escapeHtml(task)}" ${changeActionAttrs('renameProgressTask', [index])} class="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-figjam">
                        <button type="button" ${actionAttrs('deleteProgressTask', [index])} ${deleteAttrs} class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 ${deleteClass} flex items-center justify-center transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="bg-white border border-slate-100 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-figjamLight text-figjam flex items-center justify-center"><i data-lucide="list-plus" class="w-5 h-5"></i></div>
                            <h3 class="text-[16px] font-extrabold text-slate-800">진척도 항목</h3>
                        </div>
                        <div class="flex items-center gap-2 w-full lg:w-auto">
                            <input id="ptm-new-task" type="text" data-enter-action="addProgressTask" class="flex-1 lg:w-[220px] border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-figjam bg-slate-50" placeholder="항목 추가">
                            <button type="button" ${actionAttrs('addProgressTask')} class="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-figjam text-white rounded-xl font-bold text-sm hover:bg-[#7c4ced] transition-colors"><i data-lucide="plus" class="w-4 h-4"></i> 추가</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mt-4">${taskRows}</div>
                </div>
            `;
            refreshIcons();
        };

        window.renderChart = function() {
            const canvas = document.getElementById('progressChart');
            if (!canvas) return;

            syncProgressShape();
            const progressData = getProgressData();
            const datasets = studentsList.map((student, index) => ({
                label: student,
                data: tasksList.map((task) => progressData[student]?.[task] || 0),
                borderColor: studentColors[index % studentColors.length],
                backgroundColor: `${studentColors[index % studentColors.length]}15`,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: studentColors[index % studentColors.length],
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
            }));

            const currentChart = getMyChart();
            if (currentChart) {
                currentChart.data.labels = [...tasksList];
                currentChart.data.datasets = datasets;
                currentChart.update();
            } else {
                setMyChart(new Chart(canvas, {
                    type: 'line',
                    data: { labels: tasksList, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.9)',
                                titleFont: { family: 'Pretendard', size: 13, weight: 'bold' },
                                bodyFont: { family: 'Pretendard', size: 12 },
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: { label: (item) => ` ${item.dataset.label}: ${item.parsed.y}%` }
                            }
                        },
                        scales: {
                            y: {
                                min: 0,
                                max: 100,
                                grid: { color: '#f1f5f9', borderDash: [5, 5] },
                                ticks: { font: { family: 'Pretendard', size: 11, weight: 'bold' }, color: '#94a3b8', stepSize: 20 }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { font: { family: 'Pretendard', size: 11, weight: 'bold' }, color: '#64748b', maxRotation: 45, minRotation: 45 }
                            }
                        }
                    }
                }));
            }

            window.renderProgressTaskManager();
            window.renderStudentLegend();
        };

        window.openModal = function(student) {
            setCurrentEditingStudent(student);

            const title = document.getElementById('modal-title');
            const grid = document.getElementById('modal-form-grid');
            if (!title || !grid) return;

            const progressData = getProgressData();
            title.textContent = `${student} 진척도 수정`;
            grid.innerHTML = tasksList.map((task, index) => `
                <div class="relative bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label class="block text-[11px] font-bold text-slate-500 mb-2 truncate"><span class="text-slate-300 mr-1">${index + 1}.</span>${escapeHtml(task)}</label>
                    <div class="relative">
                        <input type="number" id="input-${index}" value="${progressData[student]?.[task] || 0}" min="0" max="100" class="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-sm font-bold outline-none focus:border-figjam">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">%</span>
                    </div>
                </div>
            `).join('');

            const modal = document.getElementById('modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => modal.classList.add('opacity-100'), 10);
        };

        window.closeModal = function() {
            const modal = document.getElementById('modal');
            modal.classList.remove('opacity-100');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                setCurrentEditingStudent('');
            }, 300);
        };

        window.saveData = function() {
            const student = getCurrentEditingStudent();
            if (!student) return;

            const progressData = getProgressData();
            if (!progressData[student]) progressData[student] = {};
            tasksList.forEach((task, index) => {
                progressData[student][task] = clampPercent(document.getElementById(`input-${index}`)?.value);
            });

            saveToCloud();
            window.renderChart();
            window.updateSummary();
            window.closeModal();
            showToast('저장됨');
        };

        window.copyProgressData = function() {
            const progressData = getProgressData();
            let text = `이름\t${tasksList.join('\t')}\n`;
            studentsList.forEach((student) => {
                text += `${student}\t${tasksList.map((task) => `${progressData[student]?.[task] || 0}%`).join('\t')}\n`;
            });
            navigator.clipboard.writeText(text).then(() => showToast('복사됨')).catch(() => showToast('실패'));
        };

        window.addProgressTask = function() {
            const input = document.getElementById('ptm-new-task');
            const taskName = normalizeTaskName(input?.value);
            if (!taskName) return showToast('항목명을 입력하세요.');
            if (tasksList.includes(taskName)) return showToast('이미 있는 항목입니다.');

            tasksList.push(taskName);
            const progressData = getProgressData();
            studentsList.forEach((student) => {
                if (!progressData[student]) progressData[student] = {};
                progressData[student][taskName] = 0;
            });
            if (input) input.value = '';

            saveToCloud();
            refreshProgressDashboard();
            showToast('추가됨');
        };

        window.renameProgressTask = function(index, nextName) {
            const taskIndex = parseInt(index, 10);
            const taskName = normalizeTaskName(nextName);
            const previousName = tasksList[taskIndex];
            if (!previousName) return;
            if (!taskName) {
                window.renderProgressTaskManager();
                return showToast('항목명을 입력하세요.');
            }
            if (tasksList.some((task, currentIndex) => currentIndex !== taskIndex && task === taskName)) {
                window.renderProgressTaskManager();
                return showToast('이미 있는 항목입니다.');
            }
            if (previousName === taskName) return;

            tasksList[taskIndex] = taskName;
            const progressData = getProgressData();
            studentsList.forEach((student) => {
                if (!progressData[student]) progressData[student] = {};
                const previousValue = progressData[student][previousName] ?? 0;
                if (progressData[student][taskName] === undefined) progressData[student][taskName] = previousValue;
                delete progressData[student][previousName];
            });

            saveToCloud();
            refreshProgressDashboard();
            showToast('저장됨');
        };

        window.deleteProgressTask = function(index) {
            if (tasksList.length <= 1) return showToast('항목은 1개 이상 필요합니다.');
            const taskIndex = parseInt(index, 10);
            const taskName = tasksList[taskIndex];
            if (!taskName) return;
            if (!window.confirm('항목을 삭제할까요? 기존 진척도 값도 함께 삭제됩니다.')) return;

            tasksList.splice(taskIndex, 1);
            const progressData = getProgressData();
            studentsList.forEach((student) => {
                if (progressData[student]) delete progressData[student][taskName];
            });

            saveToCloud();
            refreshProgressDashboard();
            showToast('삭제됨');
        };

        window.openCommentModal = function(student) {
            const title = document.getElementById('scm-title');
            const content = document.getElementById('scm-content');
            if (!title || !content) return;

            title.textContent = `${student} 코멘트`;
            content.value = getStudentComments()[student] || '';
            setCurrentEditingStudent(student);

            const modal = document.getElementById('student-comment-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => modal.classList.add('opacity-100'), 10);
        };

        window.closeCommentModal = function() {
            const modal = document.getElementById('student-comment-modal');
            modal.classList.remove('opacity-100');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
        };

        window.saveCommentModal = function() {
            const student = getCurrentEditingStudent();
            if (!student) return;

            getStudentComments()[student] = document.getElementById('scm-content')?.value || '';
            saveToCloud();
            window.closeCommentModal();
            showToast('저장됨');
        };
    }

    window.UIUXA_PROGRESS_VIEW = { install: installProgressView };
})();
