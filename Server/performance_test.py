import sys
import asyncio
import websockets
import json
from random import randint

ADDRESS = 'localhost'
PORT = 9950

STATUS_OK = 'OK'
STATUS_ALREADY_LOGGED_IN = 'ALREADY_LOGGED_IN'
STATUS_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
STATUS_NO_USER_ID = 'NO_USER_ID'
STATUS_ENEMY_DISCONNECTED = 'ENEMY_DISCONNECTED'

async def test(uri):
    try:
        ws = await websockets.connect(uri)
        ws2 = await websockets.connect(uri)

        msg = {'actionType': 1, 'username': 'test', 'password': 'parola'}
        await ws.send(json.dumps(msg))
        resp = await ws.recv()
        resp = json.loads(resp)
        if resp['status'] != STATUS_OK:
            raise Exception('Login')

        msg = {'actionType': 1, 'username': 'test2', 'password': 'parola'}
        await ws2.send(json.dumps(msg))
        resp = await ws2.recv()
        resp = json.loads(resp)
        if resp['status'] != STATUS_OK:
            raise Exception('Login')

        msg = {'actionType': 2}
        await ws.send(json.dumps(msg))
        await ws2.send(json.dumps(msg))
        resp = await ws2.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_OK:
            resp = await ws.recv()
            resp = json.loads(resp)
            if resp['status'] != STATUS_OK:
                raise Exception('Match-making')
        else:
            raise Exception('Match-making')

        for i in range(0, 100):
            msg = {'actionType': 3, 'scorePlayer1': 0, 'scorePlayer2': 0}
            msg['picture'] = (str(randint(0, 1)) + str(randint(0, 9)) + str(randint(0, 9))) * 40000;
            await ws.send(json.dumps(msg))
            await ws2.send(json.dumps(msg))
            await ws.recv()
            await ws2.recv()

        await ws.close()
        await ws2.close()
    except:
        print('Test failed')
        await ws.close()
        await ws2.close()
        raise


if __name__ == "__main__":
    if len(sys.argv) > 1:
        ADDRESS = sys.argv[1]
    asyncio.get_event_loop().run_until_complete(test('ws://' + ADDRESS + ':' + str(PORT)))
