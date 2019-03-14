
updateTable();

function updateTable() {
    $.get('/api/network', '', gotHosts);
}
function gotHosts(data) {
    var rowsArray = data;
    for (let i = 1; i <= rowsArray.length; i++) {
        var row= rowsArray[i - 1];

        document.getElementById('hostsTable').rows[i].innerHTML = `<td>${i}</td><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td>`;
        if (i < rowsArray.length) {
            document.getElementById('hostsTable').insertRow();
        }
    }
}