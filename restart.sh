#!/bin/bash
#sleep 1

if [ -n "$1" ]; then
    DIR=$1
else
    DIR=`pwd`
fi

cd $DIR

#echo "kill old process"
process_name='test.js'
ps -efww|grep -w $process_name | grep -v "grep"
while (($? == 0))
do
        ps -efww|grep -w $process_name |grep -v grep|cut -c 11-15 | xargs kill -9
        # echo "kill " "$(pid)"
        # kill -9 $(pid)
        # echo "kill " $(v)
        ps -efww|grep -w $process_name | grep -v "grep"
done

#echo "start process"
a=`date "+%Y-%m-%d_%H_%M_%S"`
#echo  log file: ./log/$a.log

nohup node $process_name 1>./log/$a.log 2>&1 &
sync
#echo "startup over"

#sleep 5

#nohup /home/k-yuki/restart.sh 1>/dev/null  2>&1 &
#nohup /home/k-yuki/run_test.sh 1>/dev/null  2>&1 &
#sync

