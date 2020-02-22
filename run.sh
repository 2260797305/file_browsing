!/user/bin

echo "kill old process"
ps -efww|grep -w 'node http.js'|grep -v grep|cut -c 9-15 |xargs kill -9
echo "start process"
node http.js

