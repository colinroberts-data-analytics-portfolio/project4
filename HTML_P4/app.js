(function (){
 var DELIMITER = ',';
 var NEWLINE = '/n';
 var i = document.getElementById ('file');
 var table = document.getElementById('table');

 if (!i){
    return;
 }

 i.addEventListener ('change',function (){
    if (!!i.files && i.files.length > 0){
        parseCSV(i.files[0]);
    }
 });


function parseCSV(file){
    if (!file ||!FileReader ){
        return;
    }

    var reader = new FileReader();
    
    reader.onload = function (e) {
        toTable(e.target.result);
    };

    reader.readAsText(file);

    }


    function toTable(text) {
    if (!file ||!FileReader ){
        return;
    }

    //clear table
    while(!!table.lastElementChild){
        table.removeChild(table.lastElementChild);
    }

        var rows = text.split(newline);
        var headers = rows.shift().trim().split (DELIMITER);
        var htr = document.createElement('tr')

        headers.array.forEach(function (h)  {
            var th = document.createElement("th");
            var ht= h.trim();

            if (!ht){
                return;
            }
            th.textContent = ht;
            htr.appendChild(th);

        });
    
        table.appendChild(htr);

        var rtr;

        rows.forEach(function (r) {
            r = r.trim();

            if (!r){
                return;
            }

            var cols = r.split(DELIMITER);

            if (cols.length === 0) {
                return;
            }

            rtr = document.createElement('tr');

            cols.foreach(function(c){
                var td = document.createElement("td");
                var tc = c.trim();

                td.textContent = tc;
                rtr.appendChild(td);
            });

            table.appendChild(rtr);
        });
    }
})();