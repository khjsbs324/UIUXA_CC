export const STUDENTS = [
  '강민경',
  '김정은',
  '김지선',
  '박주연',
  '박찬미',
  '이은경',
  '이은수',
  '이지희',
  '임연우',
  '최지혜',
  '허지민'
];

export const TASKS = ['로고', '패키지 초안', 'Web Wire'];

export function createEmptyProgress() {
  return STUDENTS.reduce((progress, student) => {
    progress[student] = TASKS.reduce((tasks, task) => {
      tasks[task] = 0;
      return tasks;
    }, {});
    return progress;
  }, {});
}

export function createDefaultState() {
  return {
    boardData: [],
    progressData: createEmptyProgress(),
    studentComments: {}
  };
}
