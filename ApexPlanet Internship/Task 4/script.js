/* Task 4 – Advanced To‑Do App (LocalStorage, Filters, Sorting, Drag & Drop, Import/Export, Dark Mode) */
const STORAGE_KEY = "anuj_todo_tasks_v1";
const THEME_KEY = "anuj_theme_mode";

let tasks = loadTasks();
let filter = "all";
let search = "";
let sortBy = "created-desc";
let dragSrcId = null;

// Theme
const root = document.documentElement;
if (localStorage.getItem(THEME_KEY) === "dark") root.classList.add("dark");
document.getElementById("themeToggle").addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, root.classList.contains("dark") ? "dark" : "light");
});

// Elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const dueInput = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const counter = document.getElementById("counter");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

document.querySelectorAll(".filters .chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filters .chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", (e) => { search = e.target.value.toLowerCase(); render(); });
sortSelect.addEventListener("change", (e) => { sortBy = e.target.value; render(); });

// Form submit
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  const t = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    text,
    completed: false,
    priority: prioritySelect.value, // high | normal | low
    due: dueInput.value || null,
    createdAt: Date.now(),
    order: tasks.length ? Math.max(...tasks.map(x=>x.order||0))+1 : 1,
  };
  tasks.push(t);
  saveTasks();
  taskForm.reset();
  render(true);
  taskInput.focus();
});

// Bulk actions
document.getElementById("completeAll").addEventListener("click", () => {
  tasks.forEach(t => t.completed = true);
  saveTasks(); render();
});
document.getElementById("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks(); render();
});
document.getElementById("deleteAll").addEventListener("click", () => {
  if (confirm("Delete ALL tasks? This cannot be undone.")) {
    tasks = []; saveTasks(); render();
  }
});

// Import / Export
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tasks-export.json"; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        tasks = data; saveTasks(); render();
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  reader.readAsText(file);
});

function loadTasks(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch{ return []; }
}
function saveTasks(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function applyFilters(list){
  let out = list.slice();
  // filter
  if (filter === "active") out = out.filter(t => !t.completed);
  if (filter === "completed") out = out.filter(t => t.completed);
  // search
  if (search) out = out.filter(t => t.text.toLowerCase().includes(search));
  // sort
  const priorityRank = {high:3, normal:2, low:1};
  out.sort((a,b) => {
    switch (sortBy){
      case "created-asc": return (a.createdAt||0) - (b.createdAt||0);
      case "created-desc": return (b.createdAt||0) - (a.createdAt||0);
      case "due-asc": return (a.due?new Date(a.due):Infinity) - (b.due?new Date(b.due):Infinity);
      case "due-desc": return (b.due?new Date(b.due):-Infinity) - (a.due?new Date(a.due):-Infinity);
      case "priority-desc": return (priorityRank[b.priority]||0) - (priorityRank[a.priority]||0);
      case "priority-asc": return (priorityRank[a.priority]||0) - (priorityRank[b.priority]||0);
      default: return (a.order||0) - (b.order||0);
    }
  });
  return out;
}

function render(focusNew=false){
  const list = applyFilters(tasks);
  taskList.innerHTML = "";
  if (!list.length){
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
  list.forEach(t => taskList.appendChild(renderItem(t)));
  const remaining = tasks.filter(t=>!t.completed).length;
  counter.textContent = `${remaining} item${remaining!==1?"s":""} left`;
  if (focusNew) taskInput.focus();
}

function renderItem(task){
  const tpl = document.getElementById("taskItemTemplate");
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = task.id;
  if (task.completed) node.classList.add("completed");

  const checkbox = node.querySelector(".toggle");
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked; saveTasks(); render();
  });

  const textEl = node.querySelector(".text");
  textEl.textContent = task.text;

  const editInput = node.querySelector(".editInput");
  editInput.value = task.text;

  const metaPriority = node.querySelector(".badge.priority");
  metaPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  metaPriority.classList.add(task.priority === "high" ? "high" : (task.priority === "low" ? "low" : ""));

  const metaDue = node.querySelector(".badge.due");
  metaDue.textContent = task.due ? `Due: ${task.due}` : "No due";
  if (!task.due) metaDue.style.display = "none";

  // Edit
  node.querySelector(".edit").addEventListener("click", () => enterEdit(node, editInput, textEl, task));
  node.addEventListener("dblclick", () => enterEdit(node, editInput, textEl, task));
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commitEdit(node, editInput, textEl, task);
    if (e.key === "Escape") cancelEdit(node, editInput, textEl);
  });
  editInput.addEventListener("blur", () => commitEdit(node, editInput, textEl, task));

  // Delete
  node.querySelector(".delete").addEventListener("click", () => {
    if (confirm("Delete this task?")) {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks(); render();
    }
  });

  // Drag & Drop
  node.addEventListener("dragstart", (e) => { dragSrcId = task.id; e.dataTransfer.effectAllowed = "move"; node.classList.add("dragging"); });
  node.addEventListener("dragend", () => { dragSrcId = null; node.classList.remove("dragging"); saveTasks(); render(); });
  node.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
  node.addEventListener("drop", (e) => {
    e.preventDefault();
    const srcId = dragSrcId;
    const dstId = task.id;
    if (!srcId || srcId === dstId) return;
    reorderTasks(srcId, dstId);
  });

  return node;
}

function enterEdit(node, input, textEl, task){
  node.classList.add("editing");
  input.value = task.text;
  input.focus();
  input.select();
}
function commitEdit(node, input, textEl, task){
  const val = input.value.trim();
  if (!val) return cancelEdit(node, input, textEl);
  task.text = val;
  node.classList.remove("editing");
  saveTasks(); render();
}
function cancelEdit(node, input, textEl){
  node.classList.remove("editing");
}

function reorderTasks(srcId, dstId){
  const src = tasks.find(t=>t.id===srcId);
  const dst = tasks.find(t=>t.id===dstId);
  if (!src || !dst) return;
  // simple swap of "order"
  const tmp = src.order || 0;
  src.order = dst.order || 0;
  dst.order = tmp;
  saveTasks();
}

// Initial seed (optional for first run)
if (!tasks.length){
  tasks = [
    {id: "seed1", text:"Review internship Task 4 requirements", completed:false, priority:"high", due:null, createdAt:Date.now()-100000, order:1},
    {id: "seed2", text:"Build To‑Do UI and local storage", completed:false, priority:"normal", due:null, createdAt:Date.now()-80000, order:2},
    {id: "seed3", text:"Record demo video for LinkedIn", completed:false, priority:"low", due:null, createdAt:Date.now()-60000, order:3}
  ];
  saveTasks();
}

render();
