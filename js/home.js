(function () {


    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
    }

    
    var obj1 = { 
                    id: 1, 
                    category: "Working",
                    items: [
                            {title: "Scrivere Patch per Carmelo", state:0},
                            {title: "Implementare Checklist", state:0},
                            {title: "Leggere Tesi Marco", state:0}
                        ]
                };

    var obj2 = { 
                    id: 2, 
                    category: "Free Time",
                    items: [
                            {title: "Volley", state:0},
                            {title: "Telephone to Alessandra", state:0}
                        ]
                };
                
    
    // Let us open our database.
    // If the database does not exist, then it is created; if the database already exists, then it is simply opened.
    /*var request = window.indexedDB.open("CheckListDB", 1),
        createObjectStore = function (dataBase) {
        console.log("Creating objectStore");
        //ObjectStore represent a Table
        dataBase.createObjectStore("list");
    };*/
    var request = window.indexedDB.open("ck01", 1)

    //IF request give me an error --> DB not open
    request.onerror = function(event) {
        
    };

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
     
        // Create an objectStore to hold information about our customers. We're
        // going to use "id" as our key path because it's guaranteed to be
        // unique. An objectStore represent a table.
        var objectStore = db.createObjectStore("list", { keyPath: "id" });
     
        // Create an index to search customers by category. We may have duplicates
        // so we can't use a unique index.
        objectStore.createIndex("category", "category", { unique: false });
     
        // Store values in the newly created objectStore.
        objectStore.add(obj1);
        objectStore.add(obj2);
    };

    var db;
    //IF request is sucesses --> DB open
    request.onsuccess = function(event) {
        db = request.result;

        // To start writing something to the database, you need to initiate a transaction with an objectStore name 
        // and the type of action you want to do – in this case read and write.
        var transaction = db.transaction(["list"], "readwrite");

        var objectStore = transaction.objectStore("list");

        // read elements in DB with cursor
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                alert("Category for ID " + cursor.key + " is " + cursor.value.category + " and list of Items: " + JSON.stringify(cursor.value.items));
                cursor.continue();
            }
        };
    };

})();
