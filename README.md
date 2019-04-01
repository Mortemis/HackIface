# HackIface
Server admin dashboard. 

To install just clone this repository and run
`npm i`

![Screenshot](docs/screenshot.jpg)

To configure the server use config.json file.

Start the web server using `nodemon` , `forever` or just
`node main`

API routes:
```
/api/sysinfo/coreload   - CPU load.
/api/sysinfo/temp       - CPU temperature.
/api/sysinfo/mem        - Total memory.
/api/sysinfo/usedmem    - Used memory.
/api/sysinfo/uptime     - Uptime in seconds.
/api/sysinfo/ip         - System local area IP address.
/api/sysinfo/mac        - System MAC adress.    

/api/network            - All alive hosts in the subnet. 
(Array of json objects: {ip, mac, note})
```

Uses h4x0r b007s7r4p theme:
https://github.com/brobin/hacker-bootstrap