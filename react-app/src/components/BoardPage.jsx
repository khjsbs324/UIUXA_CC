import { Send, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { STUDENTS } from '../constants.js';

function formatDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BoardPage({ dashboardState, onSave }) {
  const [studentName, setStudentName] = useState(STUDENTS[0]);
  const [content, setContent] = useState('');

  const posts = useMemo(
    () => [...(dashboardState.boardData || [])],
    [dashboardState.boardData]
  );

  const submitPost = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!studentName || !trimmed) return;

    const nextPost = {
      id: `post_${Date.now()}`,
      studentName,
      content: trimmed,
      file: null,
      date: formatDate()
    };

    await onSave({
      ...dashboardState,
      boardData: [nextPost, ...posts]
    });

    setContent('');
  };

  const deletePost = async (postId) => {
    await onSave({
      ...dashboardState,
      boardData: posts.filter((post) => post.id !== postId)
    });
  };

  return (
    <section className="page-grid board-layout">
      <form className="panel board-form" onSubmit={submitPost}>
        <h2>결과물 등록</h2>
        <label>
          작성자
          <select value={studentName} onChange={(event) => setStudentName(event.target.value)}>
            {STUDENTS.map((student) => (
              <option key={student} value={student}>
                {student}
              </option>
            ))}
          </select>
        </label>

        <label>
          작품 설명 및 피드백 의견
          <textarea
            rows={8}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="기획 의도, 시각 요소 특징, 피드백을 받고 싶은 부분을 작성하세요."
          />
        </label>

        <button className="primary-button" type="submit">
          <Send size={16} />
          공유 게시판에 전송
        </button>
      </form>

      <div className="board-list">
        {posts.length === 0 ? (
          <div className="empty-state">게시판에 공유된 디자인 결과물이 없습니다.</div>
        ) : (
          posts.map((post) => (
            <article className="post-card" key={post.id}>
              <header>
                <span className="avatar">{post.studentName?.charAt(0) || '?'}</span>
                <div>
                  <h3>{post.studentName}</h3>
                  <time>{post.date}</time>
                </div>
                <button
                  aria-label="게시글 삭제"
                  className="icon-button"
                  onClick={() => deletePost(post.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </header>
              <p>{post.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
