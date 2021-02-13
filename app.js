const toggleTheme = document.querySelector('#toggle-theme');
const todoForm = document.querySelector('#todo-form');
const todoListElement = document.querySelector('.todo-list');
const clearCompleted = document.querySelector('.clear-completed');
const todoCategories = document.querySelectorAll('.todo-category');

let index = 0;
let todos = [];

getThemeFromLocalStorage();
getTodosFromLocaleStorage();

// Memuat theme yang sudah disimpan di locale storage
function getThemeFromLocalStorage() {
   const theme = JSON.parse(localStorage.getItem('theme')) ?? 'light';

   console.log(typeof theme, theme);

   if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      toggleTheme.classList.add('dark');
      toggleTheme.src = './images/icon-sun.svg';
      toggleTheme.alt = 'Sun';
   } else {
      document.documentElement.classList.remove('dark');
      toggleTheme.classList.remove('dark');
      toggleTheme.src = './images/icon-moon.svg';
      toggleTheme.alt = 'Moon';
   }
}

// Memuat data todolist yang sudah disimpan di locale storage
function getTodosFromLocaleStorage() {
   todos = JSON.parse(localStorage.getItem('todos')) ?? [];

   todos.forEach(todo => createElementTodo(todo));
   updateItemsLeft();
}

// Ganti theme dark / light
function changeTheme() {
   this.classList.toggle('dark');

   if (this.classList.contains('dark')) {
      this.src = './images/icon-sun.svg';
      this.alt = 'Sun';
      document.documentElement.classList.add('dark');
      saveThemeToLocaleStorage('dark');
   } else {
      this.src = './images/icon-moon.svg';
      this.alt = 'Moon';
      document.documentElement.classList.remove('dark');
      saveThemeToLocaleStorage('light');
   }
}

// Save theme ke local storage
function saveThemeToLocaleStorage(theme) {
   localStorage.setItem('theme', JSON.stringify(theme));
}

// Tambah todo baru
function addNewTodo(e) {
   // agar ketika di submit formnya tidak mereload halaman
   e.preventDefault();
   // ambil value todo + hapus karakter spasi yg double
   const todoName = this['todo'].value.trim().replace(/\s+\s/g, ' ');
   // jika value todonya kosong, munculkan alert
   if (todoName === '') return alert('Todo tidak boleh kosong!');
   // jika todo sudah ada, munculkan alert
   const sameTodo = todos.some(todo => todo.name === todoName);
   if (sameTodo) return alert('Todo sudah ada!');

   // push todo ke array todos
   todos.push({ name: todoName, done: false });

   createElementTodo({ name: todoName, done: false });
   updateItemsLeft();
   saveTodosToLocaleStorage(todos);

   // reset form
   this.reset();
}

// Simpan todolist ke locale storage
function saveTodosToLocaleStorage(todos) {
   localStorage.setItem('todos', JSON.stringify(todos));
}

// Buat elemen todo item
function createElementTodo(todo) {
   const todoItem = document.createElement('li');
   todoItem.classList.add('todo-item');
   todoItem.addEventListener('dragenter', dragEnter);
   todoItem.addEventListener('dragleave', dragLeave);
   todoItem.addEventListener('dragover', dragOver);
   todoItem.addEventListener('drop', drop);

   todoItem.innerHTML = /*html*/ `
   <div class="todo-body" draggable="true" ondrag="drag(event)">
      <input type="checkbox" id="todo-${++index}" ${todo.done ? 'checked' : ''} onchange="updateItemsLeft()" onclick="toggleDone(event)">
      <label class="todo-label" for="todo-${index}">
         <span class="todo-check"><img src="./images/icon-check.svg" alt="Check"></span>
         <p class="todo-name">${todo.name}</p>
      </label>
      <button type="button" class="btn-delete" data-todo="${todo.name}" onclick="deleteTodo(this)">
         <img src="./images/icon-cross.svg" alt="Icon Close">
      </button>
   </div>
   `;

   // Insert <li / todoItem> sebelum first child dari <ul / todo-list element>
   todoListElement.insertBefore(todoItem, todoListElement.childNodes[0]);
}

// Update jumlah item todo
function updateItemsLeft() {
   const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
   const itemsLeft = checkboxes.filter(checkbox => checkbox.checked !== true);
   document.querySelector('.total').textContent = itemsLeft.length;
}

// Hapus todo 
function deleteTodo(e) {
   // ambil nama todo dari atribute data-todo pada button-delete yg diklik saat ini
   const todoName = e.dataset.todo;
   // ambil elemen li / todo-item yg merupakan wrapper dari button-delete yg diklik saat ini
   const todoItem = e.closest('li');
   // hapus elemen li / todo-item dari DOM
   todoItem.remove();
   // hapus todo dari array todos
   todos = todos.filter(todo => todo.name !== todoName);
   // simpan todolist ke locale storage
   saveTodosToLocaleStorage(todos)

   updateItemsLeft();
}

// Clear todo yang telah diselesaikan
function clearCompletedTodo(e) {
   e.preventDefault();

   // jika tidak ada todo, munculkan alert
   if (todos.length === 0) return alert('Anda belum memiliki todo!');

   // ambil semua elemen input type checkbox
   const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));

   // variabel berisi true (jika ada todo yg completed) / false (jika tidak ada todo yg completed)
   const hasCompletedTodo = checkboxes.some(checkbox => checkbox.checked);

   // jika belum ada todo yg diselesaikan, munculkan alert
   if (!hasCompletedTodo) return alert('Belum ada todo yang diselesaikan!');

   checkboxes.forEach(checkbox => {
      const todoItem = checkbox.closest('li');
      const todoName = todoItem.querySelector('.todo-name').textContent;

      // jika todo / checkboxnya di checklist
      if (checkbox.checked) {
         // hapus todo item dari DOM
         todoItem.remove();
         // hapus todo yg di checklist dari array todos
         todos = todos.filter(todo => todo.name !== todoName);
         // simpan todolist ke locale storage
         saveTodosToLocaleStorage(todos);
      }
   });
}

// Filter todo berdasarkan kategori (all | active | completed)
function filterTodo(e) {
   e.preventDefault();

   // clear active class 
   document.querySelectorAll('.todo-category').forEach(todoCategory => todoCategory.classList.remove('active'));
   // tambahkan class active pada link yg diklik saat ini
   this.classList.add('active');

   const category = this.dataset.category;
   const checkboxes = document.querySelectorAll('input[type="checkbox"]');

   // all todo
   if (category === 'all') {
      checkboxes.forEach(checkbox => {
         const todoItem = checkbox.closest('li');
         // tampilkan semua todo item
         if (checkbox.checked || !checkbox.checked) todoItem.style.display = 'block';
      });

      return;
   }

   // active todo
   if (category === 'active') {
      checkboxes.forEach(checkbox => {
         const todoItem = checkbox.closest('li');
         // sembunyikan todo yg di checklist
         if (checkbox.checked) {
            todoItem.style.display = 'none';
         } else {
            todoItem.style.display = 'block';
         }
      });

      return;
   }

   // completed todo
   if (category === 'completed') {
      checkboxes.forEach(checkbox => {
         const todoItem = checkbox.closest('li');
         // sembunyikan todo yg di tidak di checklist
         if (checkbox.checked) {
            todoItem.style.display = 'block';
         } else {
            todoItem.style.display = 'none';
         }
      });

      return;
   }
};

function toggleDone(e) {
   const el = e.target;
   const todoName = el.closest('.todo-body').querySelector('.todo-name').textContent;

   todos.forEach(todo => {
      if (todo.name === todoName) todo.done ? todo.done = false : todo.done = true;
      saveTodosToLocaleStorage(todos);
   });
}

// Drag n Drop Functionality //
function drag(e) {
   e.target.classList.add('dragged-item');
}

function dragEnter() {
   this.classList.add('dragenter');
}

function dragLeave() {
   this.classList.remove('dragenter');
}

function dragOver(e) {
   e.preventDefault();
}

function drop() {
   this.classList.remove('dragenter');

   const fromItem = document.querySelector('.dragged-item');
   const toItem = this.querySelector('.todo-body');

   // jangan swap item, jika item yg di drag itu di drop pada parent elemen dari item itu sendiri 
   if (this === fromItem.closest('.todo-item')) return;

   swapItems(fromItem, toItem);
   fromItem.classList.remove('dragged-item');
}

// Swap item
function swapItems(fromItem, toItem) {
   const todoItemOne = fromItem.closest('.todo-item');
   const todoItemTwo = toItem.closest('.todo-item');

   const todoOne = fromItem.querySelector('.todo-name').textContent;
   const todoTwo = toItem.querySelector('.todo-name').textContent;

   todoItemOne.removeChild(fromItem);
   todoItemTwo.removeChild(toItem);

   todoItemOne.appendChild(toItem);
   todoItemTwo.appendChild(fromItem);

   swapTodos(todoOne, todoTwo);
}

// Swap todo
function swapTodos(todoOne, todoTwo) {
   const idxTodoOne = todos.findIndex(todo => todo.name === todoOne);
   const idxTodoTwo = todos.findIndex(todo => todo.name === todoTwo);

   let isDone = todos[idxTodoTwo].done;

   todos[idxTodoTwo].name = todoOne;
   todos[idxTodoTwo].done = todos[idxTodoOne].done;

   todos[idxTodoOne].name = todoTwo;
   todos[idxTodoOne].done = isDone;

   saveTodosToLocaleStorage(todos);
}

// Event listeners
toggleTheme.addEventListener('click', changeTheme);
todoForm.addEventListener('submit', addNewTodo);
clearCompleted.addEventListener('click', clearCompletedTodo);
todoCategories.forEach(todoCategory => todoCategory.addEventListener('click', filterTodo));