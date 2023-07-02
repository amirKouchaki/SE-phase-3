/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.05889860847368, "KoPercent": 3.941101391526321};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23096638960661622, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3361426578999801, 500, 1500, "create post-0"], "isController": false}, {"data": [0.26541656681843595, 500, 1500, "login"], "isController": false}, {"data": [0.3118748754732018, 500, 1500, "create post-1"], "isController": false}, {"data": [0.30841831633673267, 500, 1500, "dashboard"], "isController": false}, {"data": [0.315720009427292, 500, 1500, "update post-1"], "isController": false}, {"data": [5.76930728524251E-4, 500, 1500, "create post"], "isController": false}, {"data": [0.0, 500, 1500, "update post"], "isController": false}, {"data": [0.3386283290124912, 500, 1500, "update post-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 192738, 7596, 3.941101391526321, 1670.2476730068681, 4, 9803, 1504.0, 2704.9000000000015, 2902.0, 3372.9900000000016, 34.75854964776712, 847.8671509654641, 7.1400164310873135], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["create post-0", 25095, 0, 0.0, 1305.3494720063823, 96, 6018, 1183.0, 1665.0, 1728.0, 1871.0, 4.525767387639416, 5.8170963359724475, 0.8397419957534072], "isController": false}, {"data": ["login", 25038, 3683, 14.709641345155363, 1376.1342759006398, 19, 6411, 1250.0, 1727.0, 1786.0, 1957.0, 4.515840340749534, 147.2933049999319, 0.8512068579027116], "isController": false}, {"data": ["create post-1", 25095, 36, 0.1434548714883443, 1372.9509862522366, 81, 6386, 1251.0, 1726.0, 1791.0, 1962.0, 4.525778814485811, 140.788624221571, 0.6664182041111818], "isController": false}, {"data": ["dashboard", 25005, 48, 0.19196160767846432, 1381.987362527493, 5, 6338, 1252.0, 1735.0, 1800.0, 1974.9900000000016, 4.5106873796902, 140.2543187156794, 0.66387335678076], "isController": false}, {"data": ["update post-1", 21215, 14, 0.06599104407259015, 1363.097195380632, 114, 6066, 1244.0, 1722.0, 1788.0, 1955.9900000000016, 12.397805036261314, 385.94206382418815, 1.8269855106314903], "isController": false}, {"data": ["create post", 25133, 74, 0.2944336131778936, 2675.3251899892334, 4, 9703, 2677.0, 3214.0, 3349.0, 3636.0, 4.532508526068191, 146.6198189615478, 1.5061213050510969], "isController": false}, {"data": ["update post", 24942, 3741, 14.998797209526101, 2479.388381044018, 26, 9803, 2551.0, 3141.0, 3289.0, 3599.9900000000016, 4.50039515136643, 143.2087675929192, 1.3923027722168893], "isController": false}, {"data": ["update post-0", 21215, 0, 0.0, 1305.587650247476, 771, 6083, 1184.0, 1659.0, 1728.0, 1887.9900000000016, 12.389059085563053, 15.922138478284547, 2.1293695303311497], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 7346, 96.70879410215903, 3.811391630088514], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 250, 3.291205897840969, 0.12970976143780677], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 192738, 7596, "400/Bad Request", 7346, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 250, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["login", 25038, 3683, "400/Bad Request", 3651, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 32, "", "", "", "", "", ""], "isController": false}, {"data": ["create post-1", 25095, 36, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["dashboard", 25005, 48, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 48, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["update post-1", 21215, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["create post", 25133, 74, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 74, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["update post", 24942, 3741, "400/Bad Request", 3695, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 46, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
