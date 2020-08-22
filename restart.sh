echo "kill old process"
ps -efww|grep -w 'node http.js'
if [ $? -ne 0 ]; then
	ps -efww|grep -w 'node http.js'|grep -v grep|cut -c 11-15 |xargs kill -9
fi
echo "start process"
a=`date "+%Y-%m-%d_%H_%M_%S"`
echo  log file: ./log/$a.log
node http.js  1>./log/$a.log 2>&1 &


