(function() {
    function getFileIcon(type) {
        if (!type) return 'file';
        if (type.startsWith('image/')) return 'image';
        if (type.startsWith('video/')) return 'video';
        if (type.startsWith('audio/')) return 'music';
        if (type.includes('pdf')) return 'file-text';
        if (type.includes('zip') || type.includes('rar')) return 'archive';
        return 'file';
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function formatBoardDate(date = new Date()) {
        const pad = (value) => String(value).padStart(2, '0');
        return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function installBoardView(ctx) {
        const {
            actionAttrs,
            studentsList,
            studentColorClass,
            getBoardData,
            setBoardData,
            getSelectedBoardFile,
            setSelectedBoardFile,
            getCurrentEditingPostId,
            setCurrentEditingPostId,
            setPwdActionType
        } = ctx;

        const refreshIcons = () => window.lucide?.createIcons();
        const save = () => window.saveToFirebase();
        const toast = (message) => window.showToast(message);

        window.handleBoardFileSelect = function(event) {
            const file = event.target.files[0];
            if (!file) return;

            setSelectedBoardFile({
                name: file.name,
                size: file.size,
                type: file.type
            });

            const indicator = document.getElementById('board-file-indicator');
            if (indicator) {
                indicator.innerHTML = `
                    <span class="text-xs font-bold text-figjam bg-figjamLight px-2.5 py-1.5 rounded-lg border border-figjamBorder flex items-center gap-1.5 truncate max-w-[180px]">
                        <i data-lucide="file" class="w-3.5 h-3.5"></i> ${file.name}
                        <button ${actionAttrs('clearBoardFile', [], { stop: true })} class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                    </span>
                `;
                refreshIcons();
            }
        };

        window.clearBoardFile = function() {
            setSelectedBoardFile(null);
            const input = document.getElementById('board-file-input');
            if (input) input.value = '';
            const indicator = document.getElementById('board-file-indicator');
            if (indicator) indicator.innerHTML = '<span class="text-xs text-slate-400 font-medium">선택된 파일 없음</span>';
        };

        window.handleBoardNameSelect = function(value) {
            const wrapper = document.getElementById('board-custom-name-wrapper');
            if (!wrapper) return;
            wrapper.classList.toggle('hidden', value !== 'custom');
        };

        window.selectBoardStudent = function(value) {
            document.getElementById('board-student-name').value = value;

            document.querySelectorAll('.board-student-chip').forEach((chip) => {
                chip.classList.remove('ring-2', 'ring-figjam', 'border-figjam', 'bg-figjamLight');
                chip.classList.add('border-slate-200', 'bg-white');
            });

            const selectedChip = document.getElementById('chip-' + value);
            if (selectedChip) {
                selectedChip.classList.remove('border-slate-200', 'bg-white');
                selectedChip.classList.add('ring-2', 'ring-figjam', 'border-figjam', 'bg-figjamLight');
            }

            window.handleBoardNameSelect(value);
        };

        window.submitBoardPost = function() {
            const selectedName = document.getElementById('board-student-name').value;
            const customName = document.getElementById('board-custom-name').value.trim();
            const studentName = selectedName === 'custom' ? customName : selectedName;
            const content = document.getElementById('board-content').value.trim();
            const selectedBoardFile = getSelectedBoardFile();

            if (!studentName) {
                toast('작성자 이름을 선택하거나 입력해 주세요.');
                return;
            }
            if (!content && !selectedBoardFile) {
                toast('내용이나 파일을 채운 뒤 공유해 주세요.');
                return;
            }

            const boardData = getBoardData();
            const editingPostId = getCurrentEditingPostId();
            const dateText = formatBoardDate();

            if (editingPostId) {
                const index = boardData.findIndex((post) => post.id === editingPostId);
                if (index > -1) {
                    boardData[index].studentName = studentName;
                    boardData[index].content = content;
                    boardData[index].file = selectedBoardFile;
                    boardData[index].date = dateText + ' (수정됨)';
                }
                setCurrentEditingPostId(null);
                document.getElementById('board-submit-btn').innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> 공유 게시판에 전송';
                document.getElementById('board-form-title').innerHTML = '<i data-lucide="plus-circle" class="text-figjam w-5 h-5"></i> 결과물 등록';
            } else {
                boardData.unshift({
                    id: 'post_' + Date.now(),
                    studentName,
                    content,
                    file: selectedBoardFile,
                    date: dateText
                });
            }

            document.getElementById('board-content').value = '';
            document.getElementById('board-custom-name').value = '';
            document.getElementById('board-student-name').value = '';
            document.querySelectorAll('.board-student-chip').forEach((chip) => {
                chip.classList.remove('ring-2', 'ring-figjam', 'border-figjam', 'bg-figjamLight');
                chip.classList.add('border-slate-200', 'bg-white');
            });
            document.getElementById('board-custom-name-wrapper').classList.add('hidden');
            window.clearBoardFile();

            save();
            window.renderBoard();
            toast('결과물 카드가 공유되었습니다.');
        };

        window.editBoardPost = function(id) {
            const post = getBoardData().find((item) => item.id === id);
            if (!post) return;

            setCurrentEditingPostId(id);

            const customNameInput = document.getElementById('board-custom-name');
            if (studentsList.includes(post.studentName)) {
                window.selectBoardStudent(post.studentName);
            } else {
                window.selectBoardStudent('custom');
                customNameInput.value = post.studentName;
            }

            document.getElementById('board-content').value = post.content;

            if (post.file) {
                setSelectedBoardFile(post.file);
                const indicator = document.getElementById('board-file-indicator');
                if (indicator) {
                    indicator.innerHTML = `
                        <span class="text-xs font-bold text-figjam bg-figjamLight px-2.5 py-1.5 rounded-lg border border-figjamBorder flex items-center gap-1.5 truncate max-w-[180px]">
                            <i data-lucide="file" class="w-3.5 h-3.5"></i> ${post.file.name}
                            <button ${actionAttrs('clearBoardFile', [], { stop: true })} class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                        </span>
                    `;
                    refreshIcons();
                }
            } else {
                window.clearBoardFile();
            }

            document.getElementById('board-form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
            const formCard = document.getElementById('board-form-card');
            formCard.classList.add('ring-2', 'ring-figjam');
            setTimeout(() => formCard.classList.remove('ring-2', 'ring-figjam'), 1000);

            document.getElementById('board-submit-btn').innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 데이터 교체 완료';
            document.getElementById('board-form-title').innerHTML = '<i data-lucide="edit-3" class="text-figjam w-5 h-5"></i> 공유 결과물 수정';
            refreshIcons();
        };

        window.deleteBoardPost = function(id) {
            setBoardData(getBoardData().filter((post) => post.id !== id));
            save();
            window.renderBoard();
            toast('결과물 카드가 삭제되었습니다.');
        };

        window.promptClearBoard = function() {
            setPwdActionType('clearBoard');
            document.getElementById('pwd-modal-title').textContent = '게시판 모든 리스트 초기화';
            document.getElementById('pwd-input').value = '';
            document.getElementById('pwd-error').classList.add('hidden');
            const modal = document.getElementById('pwd-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                modal.classList.add('opacity-100');
                document.getElementById('pwd-input').focus();
            }, 10);
        };

        window.executeClearBoard = function() {
            setBoardData([]);
            save();
            window.renderBoard();
            toast('게시판 모든 데이터가 초기화되었습니다.');
        };

        window.downloadMockFile = function(id) {
            const post = getBoardData().find((item) => item.id === id);
            if (!post || !post.file) return;
            toast(`[${post.file.name}] 가상 다운로드를 실행합니다.`);
        };

        window.renderBoard = function() {
            const container = document.getElementById('render-board-list');
            if (!container) return;
            container.innerHTML = '';

            const chipContainer = document.getElementById('board-student-chips');
            if (chipContainer && chipContainer.children.length === 0) {
                let chipsHtml = '';
                studentsList.forEach((student, index) => {
                    chipsHtml += `<button type="button" ${actionAttrs('selectBoardStudent', [student])} id="chip-${student}" class="board-student-chip flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-figjam hover:bg-slate-50 transition-all group/chip"><span class="w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center text-white shadow-sm transition-transform group-hover/chip:scale-110 ${studentColorClass(index)}">${student.charAt(0)}</span><span class="text-[13px] font-bold text-slate-600">${student}</span></button>`;
                });
                chipsHtml += `<button type="button" ${actionAttrs('selectBoardStudent', ['custom'])} id="chip-custom" class="board-student-chip flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-figjam hover:bg-slate-50 transition-all"><span class="w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center bg-slate-200 text-slate-500 shadow-sm"><i data-lucide="edit-2" class="w-3 h-3"></i></span><span class="text-[13px] font-bold text-slate-600">직접 입력</span></button>`;
                chipContainer.innerHTML = chipsHtml;
                refreshIcons();
            }

            const boardData = getBoardData();
            if (boardData.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-16 text-center text-slate-400 font-medium bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <i data-lucide="inbox" class="w-12 h-12 mb-3 text-slate-300"></i>
                        게시판에 공유된 디자인 결과물이 없습니다.<br>첫 번째 작업 결과물을 우측 상단에서 전송해 보세요!
                    </div>
                `;
                refreshIcons();
                return;
            }

            boardData.forEach((post) => {
                const hasFile = post.file && post.file.name;
                const fileSection = hasFile ? `
                    <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group/file">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-figjam shadow-sm border border-slate-100">
                                <i data-lucide="${getFileIcon(post.file.type)}" class="w-5 h-5"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="text-[13px] font-bold text-slate-700 truncate" title="${post.file.name}">${post.file.name}</p>
                                <p class="text-[11px] text-slate-400 font-medium">${formatBytes(post.file.size)}</p>
                            </div>
                        </div>
                        <button ${actionAttrs('downloadMockFile', [post.id])} class="w-8 h-8 rounded-lg bg-white hover:bg-figjamLight hover:text-figjam border border-slate-100 text-slate-400 flex items-center justify-center transition-all shadow-sm">
                            <i data-lucide="download" class="w-4 h-4"></i>
                        </button>
                    </div>
                ` : '';

                container.insertAdjacentHTML('beforeend', `
                    <div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-500 transform scale-100 hover:-translate-y-1 relative group/post animate-fadeIn" id="post-card-${post.id}">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex gap-3 items-center">
                                <div class="w-10 h-10 rounded-xl bg-figjamLight text-figjam flex justify-center items-center font-bold text-[15px] shadow-sm">
                                    ${post.studentName.charAt(0)}
                                </div>
                                <div class="min-w-0">
                                    <h4 class="font-extrabold text-slate-800 text-[15px] truncate">${post.studentName}</h4>
                                    <span class="text-[11px] text-slate-400 font-medium">${post.date}</span>
                                </div>
                            </div>
                            <div class="flex gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity">
                                <button ${actionAttrs('editBoardPost', [post.id])} class="text-slate-400 hover:text-figjam bg-slate-50 p-1.5 rounded-lg border border-slate-100" title="결과물 교체/수정"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                                <button ${actionAttrs('deleteBoardPost', [post.id])} class="text-slate-400 hover:text-red-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100" title="삭제"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                        <p class="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">${post.content}</p>
                        ${fileSection}
                    </div>
                `);
            });
            refreshIcons();
        };
    }

    window.UIUXA_BOARD_VIEW = {
        install: installBoardView
    };
})();
