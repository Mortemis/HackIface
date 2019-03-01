var totalMemory;
                    $.get('/api/sysinfo/mem', '', gotTotalMem)
                    setInterval(updateMemory, 1000)
                    updateMemory();

                    function updateMemory() {
                        $.get('/api/sysinfo/usedmem', '', gotMem);
                    }
                    function gotMem(data) {
                        var usedMemory = Math.floor(data / 1024 / 1024);
                        var percentage = usedMemory / totalMemory * 100;
                        document.getElementById("memBar").style.width = `${percentage}%`;
                        document.getElementById("memText").innerText = `Memory | ${usedMemory}/${totalMemory}`;
                    }
                    function gotTotalMem(data) {
                        totalMemory = Math.floor(data / 1024 / 1024);
                    }
