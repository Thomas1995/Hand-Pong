python3.5 server.py 2> /dev/null &
SERV_PROC_ID=$!
sleep 5
python3.5 performance_test.py
TEST_STATUS=$?
kill $SERV_PROC_ID
exit $TEST_STATUS
