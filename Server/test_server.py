import sys
import asyncio
import websockets
import json

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

        # test login
        msg = {'actionType': 1, 'username': 'test', 'password': 'parola'}
        await ws.send(json.dumps(msg))
        resp = await ws.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_OK:
            print('Test passed: Login')
        else:
            raise Exception('fail')

        # test userdata
        if resp['username'] == 'test':
            print('Test passed: Getting userdata')
        else:
            raise Exception('fail')

        # test multiple login
        await ws2.send(json.dumps(msg))
        resp = await ws2.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_ALREADY_LOGGED_IN:
            print('Test passed: Multiple login')
        else:
            raise Exception('fail')

        # test no user id
        msg = {'actionType': 2}
        await ws2.send(json.dumps(msg))
        resp = await ws2.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_NO_USER_ID:
            print('Test passed: Request without user ID')
        else:
            raise Exception('fail')

        # test invalid credentials
        msg = {'actionType': 1, 'username': 'test', 'password': 'parol'}
        await ws2.send(json.dumps(msg))
        resp = await ws2.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_INVALID_CREDENTIALS:
            print('Test passed: Invalid credentials')
        else:
            raise Exception('fail')

        # test match-making
        msg = {'actionType': 1, 'username': 'thomas', 'password': 'parola'}
        await ws2.send(json.dumps(msg))
        await ws2.recv()

        msg = {'actionType': 2}
        await ws.send(json.dumps(msg))
        await ws2.send(json.dumps(msg))
        resp = await ws2.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_OK:
            resp = await ws.recv()
            resp = json.loads(resp)
            if resp['status'] == STATUS_OK:
                print('Test passed: Match-making')
            else:
                raise Exception('fail')
        else:
            raise Exception('fail')

        # test disconnect during match
        await ws2.close()
        resp = await ws.recv()
        resp = json.loads(resp)
        if resp['status'] == STATUS_ENEMY_DISCONNECTED:
            print('Test passed: Disconnect during match')
        else:
            raise Exception('fail')

        await ws.close()
    except:
        print('Some test(s) failed')
        raise


if __name__ == "__main__":
    if len(sys.argv) > 1:
        ADDRESS = sys.argv[1]
    asyncio.get_event_loop().run_until_complete(test('ws://' + ADDRESS + ':' + str(PORT)))
