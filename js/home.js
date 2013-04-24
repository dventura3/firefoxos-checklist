(function () {

    //json objects of elements contained on DB
    var todo = {};

    //istance of DB
    var db;
    
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

        //default page - show home page
        selectPage("#page_home","#page_category_details");

        //set dialog options to add new category - use plugin "tooltipster"
        $('#show_tooltip').tooltipster({
            interactive: true,
            trigger: 'click',
            position: 'bottom-right',
        });

        /*
        $(window).keypress(function() {
            $('#demo-events').tooltipster('hide');
        });
        */

        //set dialog options to add new item for one category - use plugin "tooltipster"
        $('#show_tooltip_item').tooltipster({
            interactive: true,
            trigger: 'click',
            position: 'bottom-right',
        });

        // set event "click" for next button 
        $("#next_page").live('click',function(event,data){
            selectPage("#page_home","#page_category_details");
        });

        // set event "click" for add category button
        $("#button_add_category").live('click',function(event,data){
            add_category_on_DB();
        });

        // set event "click" to show list of category to remove
        $("#show_list_category_to_remove").live('click',function(event,data){
            refresh_category_list_GUI("remove");
        });

        $("#goto_show_category").live('click',function(event,data){
            refresh_category_list_GUI("show");
        });

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
        request = window.indexedDB.open("ck02", 1);

        //IF request give me an error --> DB not open
        request.onerror = function(event) {
            
        };

        // to update version of database
        request.onupgradeneeded = function(event) {
            var db = event.target.result;
         
            // Create an objectStore to hold information about our customers. We're
            // going to use "id" as our key path because it's guaranteed to be
            // unique. An objectStore represent a table.
            var objectStore = db.createObjectStore("list", { keyPath: "id", autoIncrement: true });
         
            // Create an index to search customers by category. We may have duplicates
            // so we can't use a unique index.
            objectStore.createIndex("category", "category", { unique: false });

            objectStore.createIndex("id", "id", { unique: false });
         
            // Store values in the newly created objectStore.
            //objectStore.add(obj1);
            //objectStore.add(obj2);
        };

        //IF request is sucesses --> DB open
        request.onsuccess = function(event) {
            db = request.result;
            refresh_category_list_GUI("show");
        };
    });

    var refresh_category_list_GUI = function(operation_type){
        //remove all contents in category list
        $('.container').empty();

        //remove all elements in todo list:
        todo_list = null;

        // To start writing something to the database, you need to initiate a transaction with an objectStore name 
        // and the type of action you want to do – in this case read and write.
        var transaction = db.transaction(["list"], "readwrite");

        var objectStore = transaction.objectStore("list");

        // read elements in DB with cursor
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                //alert("Category for ID " + cursor.key + " is " + cursor.value.category + " and list of Items: " + JSON.stringify(cursor.value.items));
                if(operation_type == "show")
                    $(".container").append(html_show_category(cursor.key,cursor.value.category));
                else if(operation_type == "remove"){
                    $(".container").append(html_remove_category(cursor.key,cursor.value.category));
                }
                todo[cursor.key] = cursor.value;
                cursor.continue();
            }else{
                if(operation_type == "remove"){
                    $(".container").append("<br><br>");
                    $(".container").append("<a id='goto_show_category' style='left:35%; position: relative;' href='#' class='button_green'>Done</a>");
                }
            }
        };
    }

    var add_category_on_DB = function(){
        var transaction = db.transaction(["list"], "readwrite");
        var objectStore = transaction.objectStore("list");
        var request = objectStore.put({
            category:$("#txt_add_category").val(),
            items:[]
        });

        request.onsuccess = function(e){
            $('#show_tooltip').tooltipster('hide');
            refresh_category_list_GUI("show");
        };

        request.onerror = function(e) {
            console.log(e.value);
        };
    }

    var html_show_category = function(id, name){
        html = "";
        html += "<div id='category_"+id+"'>";
        html += "<div id='one_raw'><h1>"+name+"</h1><img src='style/icons/background/next.png' style='float:right;' /></div>";
        html += "<div id='separator'><img src=''></img></div>";
        html += "</div>";

        $("#category_"+id).live('click',function(event,data){
            //show home page
            selectPage("#page_category_details","#page_home");
            html_all_items_for_category(this.id);
        });

        return html;
    }

    var html_remove_category = function(id, name){
        html = "";
        html += "<div id='category_remove_"+id+"'>";
        html += "<div id='one_raw'><h1>"+name+"</h1><img src='style/icons/remove_category.png' style='float:right;' /></div>";
        html += "<div id='separator'><img src=''></img></div>";
        html += "</div>";

        $("#category_remove_"+id).live('click',function(event,data){
            id_cat_to_remove = this.id.split("category_remove_")[1];
            var store = db.transaction(["list"], "readwrite").objectStore("list");
            var result = store.delete(parseInt(id_cat_to_remove));
            result.onsuccess = function(evt) {
                // It's gone!
                refresh_category_list_GUI("remove");
            };

            result.onerror = function (evt) {
                console.error("[ERROR] delete category:", evt.target.errorCode);
            };
            
        });

        return html;
    }

    var html_all_items_for_category = function(category){
        
        $(".container_category").empty();

        id_category = category.split("category_")[1];

        var todo_selected = todo && todo[id_category];

        if(todo_selected){
            for(j in todo_selected.items){
                $(".container_category").append(html_single_item(todo_selected.items[j].title,todo_selected.items[j].state,j));
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
