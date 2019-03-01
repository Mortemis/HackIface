setInterval(updateLoad, 1000);
updateLoad();

function updateLoad() {
    $.get('/api/sysinfo/coreload', '', gotLoad);
}
function gotLoad(data) {
    document.getElementById("loadBar").style.width = `${data}%`;
    document.getElementById("processorLoadText").innerText = `Processor load | ${data}%`;
}