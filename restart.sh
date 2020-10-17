v="0"
echo "kill old process"
ps -efww|grep -w 'http.js' | grep -v "grep"
while (($? == 0))
do 
	ps -efww|grep -w 'http.js'|grep -v grep|cut -c 11-15 | xargs kill -9
	# echo "kill " "$(pid)"
	# kill -9 $(pid)
	# echo "kill " $(v)
	ps -efww|grep -w 'http.js' | grep -v "grep"
done

echo "start process"
a=`date "+%Y-%m-%d_%H_%M_%S"`
echo  log file: ./log/$a.log
nohup node http.js  1>./log/$a.log 2>&1 &




