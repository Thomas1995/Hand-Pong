import asyncio
import websockets
import json
import threading

ADDRESS = '192.168.43.230'
PORT = 9950

activeConnections = []
readyToPlay = []
matches = []
flags = {}

def getUserID(username, password):
    return 1

def registerUser(username, email, password):
    return 2

async def listen(websocket, path):
    userID = 0
    resp = {}

    while 1:
        ret = ""
        try:
            ret = await websocket.recv()
        except:
            activeConnections.remove(userID)
            readyToPlay.remove(userID)
            del flags[userID]
            # remeber to delete matches
            print('User-ul ' + str(userID) + ' s-a deconectat')
        msg = json.loads(ret)

        print(msg)

        if(msg['actionType'] == 0):
            userID = registerUser(msg['username'], msg['email'], msg['password'])
            print('User-ul ' + str(userID) + ' (' + msg['username'] + ') a fost creat')
            activeConnections.append(userID)
            resp['status'] = 'OK'
            await websocket.send(json.dumps(resp))

        if(msg['actionType'] == 1):
            userID = getUserID(msg['username'], msg['password'])
            print('User-ul ' + str(userID) + ' (' + msg['username'] + ') s-a conectat')
            activeConnections.append(userID)
            resp['status'] = 'OK'
            await websocket.send(json.dumps(resp))

        if(msg['actionType'] == 2):
            if userID == 0:
                resp['status'] = 'NO_USER_ID'
            else:
                if len(readyToPlay) == 0:
                    print("User-ul " + str(userID) + " asteapta sa joace")
                    readyToPlay.append(userID)
                    flags[userID] = threading.Event()
                    flags[userID].wait()
                else:
                    print("User-ul " + str(userID) + " asteapta sa joace")
                    enemyID = readyToPlay.pop()
                    print("User-ul " + str(userID) + " va juca impotriva lui " + str(enemyID))
                    matches.append((userID, enemyID))
                    flags[userID].set(True)
                    del flags[userID]
                resp['status'] = 'OK'
            await websocket.send(json.dumps(resp))


start_server = websockets.serve(listen, ADDRESS, PORT)

print('Server started...')

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
