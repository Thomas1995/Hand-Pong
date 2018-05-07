python3.5 server.py > /dev/null &
SERV_PROC_ID=$!
sleep 2
python3.5 test_server.py
kill $SERV_PROC_ID
