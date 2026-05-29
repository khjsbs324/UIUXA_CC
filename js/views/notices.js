(function() {
    const refreshIcons = () => window.lucide?.createIcons();
    const showToast = (message) => window.showToast?.(message);
    const saveToCloud = () => window.saveToFirebase?.();

    function openFadeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => modal.classList.add('opacity-100'), 10);
    }

    function closeFadeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    function todayStamp() {
        const date = new Date();
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }

    function installNoticeView(context) {
        const {
            actionAttrs,
            getIsEditMode,
            getNoticeData
        } = context;

        window.renderNoticeBoard = function() {
            const container = document.getElementById('render-notice-board');
            if (!container) return;

            const noticeData = getNoticeData();
            const posts = noticeData.posts || [];
            container.innerHTML = '';

            posts.forEach((post, index) => {
                const isActive = noticeData.activePopupId === post.id;
                const popupButtonClass = isActive ? 'bg-figjam text-white' : 'bg-slate-100 text-slate-500';
                const popupButtonText = isActive ? '작동중' : '등록';
                const editButton = getIsEditMode()
                    ? `<div class="flex gap-2 shrink-0"><button ${actionAttrs('openNoticeEditModal', [post.id], { stop: true })} class="text-slate-400 hover:text-figjam p-1.5 rounded-md hover:bg-slate-100 transition-colors"><i data-lucide="edit" class="w-4 h-4"></i></button></div>`
                    : '';

                container.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openNoticeViewModal', [post.id])} class="grid grid-cols-12 gap-4 p-5 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer items-center group"><div class="col-span-1 text-center text-[13px] font-bold text-slate-400">${posts.length - index}</div><div class="col-span-7 md:col-span-8 flex items-center gap-3">${isActive ? `<span class="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">중요</span>` : ''}<h3 class="text-[15px] font-bold text-slate-700 truncate group-hover:text-figjam transition-colors">${post.title}</h3></div><div class="col-span-4 md:col-span-3 flex items-center justify-end gap-4 pr-2"><span class="text-[13px] text-slate-400 hidden md:block">${post.date}</span><button ${actionAttrs('promptPopupPwd', [post.id], { stop: true })} class="px-3 py-1.5 rounded-lg text-[12px] flex items-center gap-1.5 shadow-sm ${popupButtonClass}"><i data-lucide="bell" class="w-3.5 h-3.5"></i> ${popupButtonText}</button>${editButton}</div></div>`);
            });

            if (getIsEditMode()) {
                container.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openNoticeEditModal', ['new'])} class="p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam bg-slate-50/50 cursor-pointer h-[120px]"><i data-lucide="plus-circle" class="w-6 h-6 mb-2"></i><span class="font-bold text-[14px]">새 작성</span></div>`);
            } else if (posts.length === 0) {
                container.innerHTML = `<div class="p-12 text-center text-slate-400 font-medium">없음</div>`;
            }
            refreshIcons();
        };

        window.openNoticeViewModal = function(id) {
            const post = getNoticeData().posts.find((item) => item.id === id);
            if (!post) return;
            document.getElementById('nvm-title').textContent = post.title;
            document.getElementById('nvm-date').textContent = post.date;
            document.getElementById('nvm-content').innerHTML = post.content.replace(/\n/g, '<br>');
            openFadeModal('notice-view-modal');
        };

        window.closeNoticeViewModal = function() {
            closeFadeModal('notice-view-modal');
        };

        window.openNoticeEditModal = function(id) {
            document.getElementById('nem-id').value = id;
            let post = { title: '', content: '' };
            if (id !== 'new') post = getNoticeData().posts.find((item) => item.id === id) || post;

            document.getElementById('nem-title').value = post.title;
            document.getElementById('nem-content').value = post.content;

            const deleteButton = document.getElementById('btn-nem-delete');
            if (id === 'new') {
                deleteButton.classList.add('hidden');
            } else {
                deleteButton.classList.remove('hidden');
                deleteButton.setAttribute('data-confirm', 'false');
                deleteButton.innerHTML = '삭제';
                deleteButton.className = 'px-5 py-2.5 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-xl mr-auto';
            }

            openFadeModal('notice-edit-modal');
        };

        window.closeNoticeEditModal = function() {
            closeFadeModal('notice-edit-modal');
        };

        window.saveNotice = function() {
            const id = document.getElementById('nem-id').value;
            const title = document.getElementById('nem-title').value.trim();
            const content = document.getElementById('nem-content').value;
            if (!title) return showToast('제목 입력');

            const noticeData = getNoticeData();
            if (id === 'new') {
                noticeData.posts.unshift({ id: `n_${Date.now()}`, title, content, date: todayStamp() });
            } else {
                const index = noticeData.posts.findIndex((post) => post.id === id);
                if (index > -1) noticeData.posts[index] = { ...noticeData.posts[index], title, content };
            }

            saveToCloud();
            window.renderNoticeBoard();
            window.closeNoticeEditModal();
            showToast('저장됨');
        };

        window.deleteNotice = function() {
            const button = document.getElementById('btn-nem-delete');
            if (button.getAttribute('data-confirm') === 'true') {
                const id = document.getElementById('nem-id').value;
                const noticeData = getNoticeData();
                noticeData.posts = noticeData.posts.filter((post) => post.id !== id);
                if (noticeData.activePopupId === id) noticeData.activePopupId = null;

                saveToCloud();
                window.renderNoticeBoard();
                window.closeNoticeEditModal();
                showToast('삭제됨');
                return;
            }

            button.setAttribute('data-confirm', 'true');
            button.innerHTML = '정말 삭제할까요?';
            button.className = 'px-5 py-2.5 text-sm font-bold text-white bg-red-500 border border-red-500 rounded-xl mr-auto';
            setTimeout(() => {
                button.setAttribute('data-confirm', 'false');
                button.innerHTML = '삭제';
                button.className = 'px-5 py-2.5 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-xl mr-auto';
            }, 3000);
        };

        window.checkGlobalPopup = function() {
            const noticeData = getNoticeData();
            if (!noticeData.activePopupId) return;

            const post = noticeData.posts.find((item) => item.id === noticeData.activePopupId);
            if (!post) return;

            const hideUntil = localStorage.getItem('hideNoticePopupUntil');
            if (hideUntil && Date.now() < parseInt(hideUntil, 10)) return;

            document.getElementById('global-notice-title').textContent = post.title;
            document.getElementById('global-notice-content').innerHTML = post.content.replace(/\n/g, '<br>');
            document.getElementById('global-notice-date').textContent = post.date;

            const modal = document.getElementById('global-notice-modal');
            const box = document.getElementById('global-notice-box');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                modal.classList.add('opacity-100');
                box.classList.remove('scale-95');
                box.classList.add('scale-100');
            }, 10);
        };

        window.closeGlobalPopup = function() {
            const checkbox = document.getElementById('hide-12h');
            if (checkbox?.checked) localStorage.setItem('hideNoticePopupUntil', Date.now() + 12 * 60 * 60 * 1000);

            const modal = document.getElementById('global-notice-modal');
            const box = document.getElementById('global-notice-box');
            modal.classList.remove('opacity-100');
            box.classList.remove('scale-100');
            box.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
        };
    }

    window.UIUXA_NOTICE_VIEW = { install: installNoticeView };
})();
