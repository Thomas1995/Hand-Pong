python3.5 server.py > /dev/null &
SERV_PROC_ID=$!
sleep 2
python3.5 test_server.py
TEST_STATUS=$?
kill $SERV_PROC_ID
exit $TEST_STATUS
