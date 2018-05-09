import sys
import asyncio
import websockets
import json
import sqlite3
import numpy as np

from ML.detect_multi_threaded import Model

ADDRESS = 'localhost'
PORT = 9950

activeConnections = {}
lastCoord = {}
frameNo = {}
readyToPlay = []
matches = []
dbConn = None
model = None

STATUS_OK = 'OK'
STATUS_ALREADY_LOGGED_IN = 'ALREADY_LOGGED_IN'
STATUS_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
STATUS_NO_USER_ID = 'NO_USER_ID'
STATUS_ENEMY_DISCONNECTED = 'ENEMY_DISCONNECTED'

def getUserID(username, password):
    cursor = dbConn.cursor()

    sql_command = 'SELECT userID FROM users WHERE username = ? AND password = ?'
    cursor.execute(sql_command, (username, password))
    result = cursor.fetchall()

    if(result == []):
        return 0

    if result[0][0] != None:
        userID = int(result[0][0])
    else:
        userID = 0

    return userID

def registerUser(username, email, password):
    cursor = dbConn.cursor()

    sql_command = 'SELECT max(userID) FROM users'
    cursor.execute(sql_command)
    result = cursor.fetchall()

    if(result == []):
        return 0

    if result[0][0] != None:
        userID = int(result[0][0]) + 1
    else:
        userID = 1

    sql_command = 'INSERT INTO users VALUES (?, ?, ?, ?, 0, 0)'
    sql_args = (str(userID), username, email, password)
    cursor.execute(sql_command, sql_args)

    try:
        sql_command = 'COMMIT'
        cursor.execute(sql_command)
    except:
        pass

    return userID

def getUserData(userID):
    cursor = dbConn.cursor()

    sql_command = 'SELECT username, email, win, loss FROM users WHERE userID = ?'
    cursor.execute(sql_command, (str(userID),))
    result = cursor.fetchall()

    ret = {}
    if(len(result) > 0 and len(result[0]) > 3):
        ret['username'] = result[0][0]
        ret['email'] = result[0][1]
        ret['win'] = result[0][2]
        ret['loss'] = result[0][3]
    return ret


async def listen(websocket, path):
    userID = 0
    picture = np.zeros((200, 200, 3), dtype=np.uint8)

    while 1:
        ret = ""
        try:
            ret = await websocket.recv()
            msg = json.loads(ret)
            resp = {}

            if(msg['actionType'] == 0):
                userID = registerUser(msg['username'], msg['email'], msg['password'])
                if userID != 0:
                    print('User-ul ' + str(userID) + ' (' + msg['username'] + ') a fost creat')
                    activeConnections[userID] = websocket
                    resp = getUserData(userID)
                    resp['status'] = STATUS_OK
                else:
                    resp['status'] = STATUS_INVALID_CREDENTIALS
                await websocket.send(json.dumps(resp))

            if(msg['actionType'] == 1):
                userID = getUserID(msg['username'], msg['password'])
                if userID != 0:
                    if userID in activeConnections:
                        resp['status'] = STATUS_ALREADY_LOGGED_IN
                        userID = 0
                    else:
                        print('User-ul ' + str(userID) + ' (' + msg['username'] + ') s-a conectat')
                        activeConnections[userID] = websocket
                        resp = getUserData(userID)
                        resp['status'] = STATUS_OK
                else:
                    resp['status'] = STATUS_INVALID_CREDENTIALS
                await websocket.send(json.dumps(resp))

            if(msg['actionType'] == 2):
                if userID == 0:
                    resp['status'] = STATUS_NO_USER_ID
                    await websocket.send(json.dumps(resp))
                else:
                    if len(readyToPlay) == 0:
                        print("User-ul " + str(userID) + " asteapta sa joace")
                        readyToPlay.append(userID)
                    else:
                        print("User-ul " + str(userID) + " asteapta sa joace")
                        enemyID = readyToPlay.pop()
                        print("User-ul " + str(userID) + " va juca impotriva lui " + str(enemyID))
                        matches.append((userID, enemyID))
                        resp['status'] = STATUS_OK

                        player1data = getUserData(userID)
                        player2data = getUserData(enemyID)

                        resp['player1_username'] = player1data['username']
                        resp['player1_win'] = player1data['win']
                        resp['player1_loss'] = player1data['loss']
                        resp['player2_username'] = player2data['username']
                        resp['player2_win'] = player2data['win']
                        resp['player2_loss'] = player2data['loss']

                        lastCoord[userID] = 0.5
                        lastCoord[enemyID] = 0.5
                        frameNo[userID] = 0
                        frameNo[enemyID] = 0

                        await websocket.send(json.dumps(resp))
                        await activeConnections[enemyID].send(json.dumps(resp))

            if(msg['actionType'] == 3):
                if userID == 0:
                    resp['status'] = STATUS_NO_USER_ID
                    await websocket.send(json.dumps(resp))
                else:
                    cnt = 0
                    for i in range(0, 200):
                        for j in range(0, 200):
                            for k in range(0, 3):
                                picture[i][j][2-k] = int(msg['picture'][cnt:(cnt+3)])
                                cnt = cnt + 3

                    coord = model.inference_frame(picture)
                    if coord != -1:
                        lastCoord[userID] = coord

                    enemyID = 0
                    for m in matches:
                        if m[0] == userID or m[1] == userID:
                            if m[0] == userID:
                                enemyID = m[1]
                            else:
                                enemyID = m[0]

                    frameNo[userID] = frameNo[userID] + 1

                    if frameNo[userID] == frameNo[enemyID]:
                        coords = json.dumps({'player1coord': lastCoord[userID], 'player2coord': lastCoord[enemyID]})
                        print({'player1coord': lastCoord[userID], 'player2coord': lastCoord[enemyID]})
                        await websocket.send(coords)
                        await activeConnections[enemyID].send(coords)

        except:
            if userID in activeConnections:
                del activeConnections[userID]
            if userID in readyToPlay:
                readyToPlay.remove(userID)
            if userID in lastCoord:
                del lastCoord[userID]
            if userID in frameNo:
                del frameNo[userID]
            for m in matches:
                if m[0] == userID or m[1] == userID:
                    enemyID = 0
                    if m[0] == userID:
                        enemyID = m[1]
                    else:
                        enemyID = m[0]
                    resp = {'status': STATUS_ENEMY_DISCONNECTED}
                    try:
                        await activeConnections[enemyID].send(json.dumps(resp))
                    except:
                        pass

            if userID != 0:
                print('User-ul ' + str(userID) + ' s-a deconectat')
            break


if __name__ == "__main__":
    if len(sys.argv) > 1:
        ADDRESS = sys.argv[1]

    start_server = websockets.serve(listen, ADDRESS, PORT)

    dbConn = sqlite3.connect("pong.db")
    cursor = dbConn.cursor()
    sql_command = """
    CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY,
    username VARCHAR(30),
    email VARCHAR(30),
    password VARCHAR(30),
    win INTEGER,
    loss INTEGER);"""
    cursor.execute(sql_command)

    model = Model()
    model.load_model()

    print('Server started...')

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
