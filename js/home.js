(function () {

    //json list of objects
    var todo_list = [];

    //to open DB
    var request;
    
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
           

    //function to show the selected page and hide others 
    function selectPage(show_page,hide1){
        jQuery(show_page).show();
        jQuery(hide1).hide();
    }     
    

    $(document).ready(function(){

        //show home page
        selectPage("#page_home","#page_category_details");

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

        // Let us open our database.
        // If the database does not exist, then it is created; if the database already exists, then it is simply opened.
        request = window.indexedDB.open("ck01", 1)

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
            //objectStore.add(obj1);
            //objectStore.add(obj2);
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
                    //alert("Category for ID " + cursor.key + " is " + cursor.value.category + " and list of Items: " + JSON.stringify(cursor.value.items));
                    $(".container").append(html_category(cursor.key,cursor.value.category));
                    todo_list.push(cursor.value);
                    cursor.continue();
                }
            };
        };
    });

    var html_category = function(id, name){
        html = "";
        html += "<div id='category_"+id+"'>";
        html += "<div id='one_raw'><h1>"+name+"</h1><img src='style/icons/background/next.png' style='float:right;' /></div>";
        html += "<div id='separator'><img src=''></img></div>";
        html += "</div>";

        $("#category_"+id).live('click',function(event,data){
            //alert(this.id);
            //show home page
            selectPage("#page_category_details","#page_home");
            html_all_items_for_category(this.id);
        });

        return html;
    }

    var html_all_items_for_category = function(category){
        
        $(".container_category").empty();

        id_category = category.split("category_")[1];

        for(i=0; i<todo_list.length; i++){
            if(todo_list[i].id == id_category){
                for(j=0; j<todo_list[i].items.length; j++){
                    $(".container_category").append(html_single_item(todo_list[i].items[j].title,todo_list[i].items[j].state,j));
                }
            }
        }
    }

    var html_single_item = function(title, state,index){
        html = "";
        html += "<div id='items_"+index+"'>";
        html += "<div id='one_raw'><h1>"+title+"</h1>"
        if(state)
            html += "<img src='style/icons/check-yes.png' style='float:right;' id='img_"+index+"' /></div>";
        else
            html += "<img src='style/icons/check-no.png' style='float:right;' id='img_"+index+"'/></div>";
        html += "<div id='separator'><img src=''></img></div>";
        html += "</div>";

        $("#items_"+index).live('click',function(event,data){
            index_item = this.id.split("items_")[1];
            if($("#img_"+index_item).attr("src")=='style/icons/check-no.png'){
                $("#img_"+index_item).attr("src",'style/icons/check-yes.png');
            }else{
                $("#img_"+index_item).attr("src",'style/icons/check-no.png');
            }
        });

        return html;
    }

})();
