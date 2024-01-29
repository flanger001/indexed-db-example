// Open a database.
// Create an object store in the database.
// Start a transaction and make a request to do some database operation, like adding or retrieving data.
// Wait for the operation to complete by listening to the right kind of DOM event.
// Do something with the results (which can be found on the request object).

(() => {
    let database
    const DATABASE_VERSION = 1
    const DATABASE_NAME = "peopleDB"
    const DATABASE_PEOPLE_STORE_NAME = "people"
    const DATABASE_PICTURE_STORE_NAME = "pictures"

    function openDatabase() {
        console.log("Opening database")
        const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

        request.onerror = (event) => {
            console.error("Why didn't you let me open a database???", event)
        }
        request.onsuccess = (event) => {
            console.log("Database successfully opened")
            database = event.target.result
            listPeopleData()
            listPictureData()
        }
        request.onupgradeneeded = (event) => {
            console.log("Database version upgrade required")
            database = event.target.result;
            console.log("Creating object stores")
            database.createObjectStore(DATABASE_PEOPLE_STORE_NAME, { autoIncrement: true })
            console.log(`Created ${DATABASE_PEOPLE_STORE_NAME} store`)
            database.createObjectStore(DATABASE_PICTURE_STORE_NAME, { autoIncrement: true })
            console.log(`Created ${DATABASE_PICTURE_STORE_NAME} store`)
        }
    }

    function clearStore(storeName) {
        const transaction = database.transaction([storeName], "readwrite")
        const request = transaction.objectStore(storeName).clear()

        request.onsuccess = (event) => {
            console.log("Store successfully cleared")
            if (event.result != null) {
                console.log("Something weird happened though:", event)
            }
        }
        request.onerror = (event) => {
            console.error("Unable to clear store")
            console.log(event)
        }
    }

    function deleteDatabase() {
        database.close()
        const request = window.indexedDB.deleteDatabase(DATABASE_NAME)
        request.onsuccess = (event) => {
            console.log("Database successfully deleted")
            console.log(event.result)
        }
        request.onerror = (event) => {
            console.error("Unable to delete database")
            console.log(event)
        }
    }

    function createEventListeners() {
        const personForm = document.forms.addperson
        const personInput = personForm.person
        personForm.addEventListener("submit", (event) => {
            event.preventDefault()
            event.stopPropagation()
            addPersonToDatabase(personInput.value)
            personForm.reset()
        })

        const pictureForm = document.forms.addpicture
        const pictureInput = pictureForm.picture
        pictureForm.addEventListener("submit", (event) => {
            event.preventDefault()
            event.stopPropagation()
            addPictureToDatabase(pictureInput.files[0])
            pictureForm.reset()
        })

        const deleteDatabaseButton = document.getElementById("delete-database")
        deleteDatabaseButton.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            deleteDatabase("people")
            document.getElementById(DATABASE_PEOPLE_STORE_NAME).innerHTML = ""
            document.getElementById(DATABASE_PICTURE_STORE_NAME).innerHTML = ""
        })

        const clearPeopleStoreButton = document.getElementById("clear-people-store")
        clearPeopleStoreButton.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            clearStore(DATABASE_PEOPLE_STORE_NAME)
            document.getElementById(DATABASE_PEOPLE_STORE_NAME).innerHTML = ""
            listPeopleData()
        })

        const clearPictureStoreButton = document.getElementById("clear-picture-store")
        clearPictureStoreButton.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            clearStore(DATABASE_PICTURE_STORE_NAME)
            document.getElementById(DATABASE_PICTURE_STORE_NAME).innerHTML = ""
            listPictureData()
        })
    }
    // People
    function listPeopleData() {
        const transaction = database.transaction([DATABASE_PEOPLE_STORE_NAME])
        const objectStore = transaction.objectStore(DATABASE_PEOPLE_STORE_NAME)
        const request = objectStore.openCursor()
        request.onsuccess = (event) => {
            const targetElement = document.getElementById(DATABASE_PEOPLE_STORE_NAME)
            const cursor = event.target.result

            if (cursor) {
                const person = cursor.value
                appendPersonToList(person, cursor.key, targetElement)
                cursor.continue()
            }
        }
    }

    function deletePersonFromDatabase(id) {
        const transaction = database.transaction([DATABASE_PEOPLE_STORE_NAME], "readwrite")
        const objectStore = transaction.objectStore(DATABASE_PEOPLE_STORE_NAME)
        const request = objectStore.delete(id)
        request.onsuccess = (event) => {
            console.log("Successfully deleted person from database")
            const element = document.querySelector(`[data-people-store-id="${id}"]`)
            element.remove()
        }
        request.onerror = (event) => {
            console.error("Unable to delete person from database")
        }
    }

    function addPersonToDatabase(name) {
        const transaction = database.transaction([DATABASE_PEOPLE_STORE_NAME], "readwrite")
        const objectStore = transaction.objectStore(DATABASE_PEOPLE_STORE_NAME)
        const person = { name }
        const request = objectStore.add(person)
        request.onsuccess = (event) => {
            const targetElement = document.getElementById(DATABASE_PEOPLE_STORE_NAME)
            const id = event.target.result
            appendPersonToList(person, id, targetElement)
            console.log("Added name to database")
        }
        request.onerror = () => console.log("Unable to add name to database")
    }

    function appendPersonToList(person, id, targetElement) {
        const element = document.createElement("p")
        element.innerText = person.name

        const deleteButton = document.createElement("button")
        deleteButton.innerText = "Delete"
        deleteButton.classList.add("button")
        deleteButton.type = "button"
        element.dataset.peopleStoreId = id
        deleteButton.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            deletePersonFromDatabase(id)
        })
        element.appendChild(deleteButton)
        targetElement.appendChild(element)
    }

    // Pictures
    function listPictureData() {
        const transaction = database.transaction([DATABASE_PICTURE_STORE_NAME])
        const objectStore = transaction.objectStore(DATABASE_PICTURE_STORE_NAME)
        const request = objectStore.openCursor()
        request.onsuccess = (event) => {
            const targetElement = document.getElementById(DATABASE_PICTURE_STORE_NAME)
            const cursor = event.target.result

            if (cursor) {
                const person = cursor.value
                appendPictureToList(person, cursor.key, targetElement)
                cursor.continue()
            }
        }
    }

    function deletePictureFromDatabase(id) {
        const transaction = database.transaction([DATABASE_PICTURE_STORE_NAME], "readwrite")
        const objectStore = transaction.objectStore(DATABASE_PICTURE_STORE_NAME)
        const request = objectStore.delete(id)
        request.onsuccess = (event) => {
            console.log("Successfully deleted picture from database")
            const element = document.querySelector(`[data-picture-store-id="${id}"]`)
            element.remove()
        }
        request.onerror = (event) => {
            console.error("Unable to delete picture from database")
        }
    }

    function addPictureToDatabase(picture) {
        const transaction = database.transaction([DATABASE_PICTURE_STORE_NAME], "readwrite")
        const objectStore = transaction.objectStore(DATABASE_PICTURE_STORE_NAME)
        const request = objectStore.add(picture)
        request.onsuccess = (event) => {
            const targetElement = document.getElementById(DATABASE_PICTURE_STORE_NAME)
            const id = event.target.result
            appendPictureToList(picture, id, targetElement)
            console.log("Added picture to database")
        }
        request.onerror = () => console.log("Unable to add picture to database")
    }

    function appendPictureToList(picture, id, targetElement) {
        const element = document.createElement("div")
        const image = document.createElement("img")
        image.src = URL.createObjectURL(picture)
        image.width = 300
        element.appendChild(image)

        const deleteButton = document.createElement("button")
        deleteButton.innerText = "Delete"
        deleteButton.classList.add("button")
        deleteButton.type = "button"
        element.dataset.pictureStoreId = id
        deleteButton.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            deletePictureFromDatabase(id)
        })
        element.appendChild(deleteButton)
        targetElement.appendChild(element)
    }

    openDatabase()
    createEventListeners()
})()
