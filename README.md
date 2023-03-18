# Sugar

Sugar is a tool for rapid web UI prototyping with no server.

It provides a **virtual REST API** that accepts JSON requests, returns JSON responses and persists data between requests like a real API.

Most importantly, its usage is transparent. It doesn't matter how requests are done: you can use `fetch`, [axios](https://github.com/axios/axios), or whatever library or method you prefer.

## Usage

Simply wrap your code with `sugar`.

```
sugar(() => {
    // your code
})
```

### No setup is needed

For example, just making a POST request to the `api/todos` *not-yet-existing* endpoint along with sending a JSON object will create the resource.

```
sugar(() => {
    let todo = {
        "text": "thing to do"
    }

    fetch('api/todos', {
        method: 'POST',
        body: JSON.stringify(todo)
    })
    .then(response => response.json())
    .then(todo => {
        console.log(todo)
    })
})
```

Output:
```
{
    "text": "thing to do",
    "id": 1
}
```

File: [example-1.html](example-1.html)

### The resource is persisted

`GET api/todos/{id}` will return an object previously posted.

```
sugar(() => {
    var ENDPOINT = 'api/todos'
    
    var todo = {
        "text": "thing to todo"
    }
    
    /*
    *  POST api/todos - create a todo
    */
    fetch(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(todo)
    })
    .then(response => response.json())
    .then(todo => {
        /*
        *  GET api/todo/{id} - retrieve the todo by id
        */
        fetch(`${ENDPOINT}/${todo.id}`)
        .then(response => response.json())
        .then(todo => {
            console.log(todo)
        })
    })
})
```

Output:
```
{
    "text": "thing to todo",
    "id": 1
}
```

File: [example-2.html](example-2.html)

### Virtual endpoints

Sugar endpoints are scoped to the `api/` URL.

Collection endpoints:
- `GET api/{resource}` - Retrieve all items
- `POST api/{resource}` - Create a new item 

Single resource endpoints:
- `GET api/{resource}/{id}` - Get an item
- `PUT api/{resource}/{id}` - Replace an item
- `PATCH api/{resource}/{id}` - Update an item's fields
- `DELETE api/{resource}/{id}` - Delete an item

### Things to know

`sugar.js`, `sweetness.js` and `localforage.min.js` must be in the same folder as html files.

## How it works

Under the hood there is a service worker acting like a remote server.

The service worker (`sweetness.js`):
- intercepts the JSON requests to `api/{resource}`
- persists the received JSON objects

For the persistence part, IndexedDB API is used through [localForage](https://github.com/localForage/localForage) library.

## Sample todo app

```
<!DOCTYPE HTML>
<html>
<head>
    <script src="sugar.js"></script>
</head>
<body>
    <div>
        <h1>Todo list</h1>
        <input id="input" type="text" placeholder="Thing to do" />
        <button id="addBtn">Add</button>
        <ul id="todos"></ul>
    </div>
    
    <script>
        sugar(() => {
            var ENDPOINT = 'api/todos'

            var input = document.getElementById("input")
            var addBtn = document.getElementById("addBtn")
            var todoList = document.getElementById("todos")

            addBtn.addEventListener('click', addTodo)

            renderTodoList()

            function renderTodoList() {
                return fetch(ENDPOINT)
                .then(response => response.json())
                .then(todos => {
                    todoList.innerHTML = ""
                    for (const todo of todos) {
                        renderTodo(todo.id, todo.text)
                    }
                })
            }
            
            function renderTodo(id, text) {
                var li = document.createElement("li")
                li.appendChild(document.createTextNode(text))
                li.onclick = () => {
                    deleteTodo(id)
                }
                todoList.appendChild(li)
            }
            
            function addTodo() {
                if (input.value.trim() === "") {
                    return
                }
                fetch(ENDPOINT, {
                    method: 'POST',
                    body: JSON.stringify({
                        "text": input.value
                    })
                })
                .then(response => response.json())
                .then(todo => {
                    input.value = ""
                    renderTodo(todo.id, todo.text)
                })
            }
            
            function deleteTodo(id) {
                fetch(ENDPOINT+'/'+id, {
                    method: 'DELETE'
                })
                .then(response => {
                    renderTodoList()
                })
            }
        })
    </script>
</body>
</html>
```

File: [example-todo.html](example-todo.html)