const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const checkbox = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateID();
  const bookObject = generateTodoObject(generatedID, title, author, year, checkbox);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateID() {
  return +new Date();
}

function generateTodoObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  const inCompleteBooklist = document.getElementById('incompleteBookshelfList');
  inCompleteBooklist.innerHTML = '';
  const completeBookList = document.getElementById('completeBookshelfList');
  completeBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) inCompleteBooklist.append(bookElement);
    else completeBookList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis : ' + bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun : ' + bookObject.year;

  const textContainer = document.createElement('article');
  textContainer.classList.add('book-Item');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('action');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');

    checkButton.addEventListener('click', function () {
      addBookToComplete(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(checkButton, trashButton);
  }

  return container;
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
    }
  });
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local Storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.getElementById('searchBook').addEventListener('submit', function (event) {
  event.preventDefault();

  const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('.book_list h3');
  for (const buku of bookList) {
    if (buku.innerText.toLowerCase().includes(searchBook)) {
      buku.parentElement.parentElement.style.display = 'block';
    } else {
      buku.parentElement.parentElement.style.display = 'none';
    }
  }
});
