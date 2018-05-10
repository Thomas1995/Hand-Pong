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
ballCoord = {}
gameOver = {}
gameVerdict = {}
readyToPlay = []
matches = []
dbConn = None
model = None

STATUS_OK = 'OK'
STATUS_ALREADY_LOGGED_IN = 'ALREADY_LOGGED_IN'
STATUS_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
STATUS_NO_USER_ID = 'NO_USER_ID'
STATUS_ENEMY_DISCONNECTED = 'ENEMY_DISCONNECTED'
STATUS_FINISH_GAME = 'FINISH_GAME'

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

def changeScoreDB(winnerID, loserID):
    cursor = dbConn.cursor()

    sql_command = 'UPDATE users SET win = win + 1 WHERE userID = ?'
    cursor.execute(sql_command, (str(winnerID),))
    cursor.fetchall()

    sql_command = 'UPDATE users SET loss = loss + 1 WHERE userID = ?'
    cursor.execute(sql_command, (str(loserID),))
    cursor.fetchall()

    try:
        sql_command = 'COMMIT'
        cursor.execute(sql_command)
    except:
        pass

async def listen(websocket, path):
    userID = 0
    picture = np.zeros((200, 200), dtype=np.uint8)

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
                        gameOver[userID] = False
                        gameOver[enemyID] = False
                        gameVerdict[userID] = False
                        gameVerdict[enemyID] = False

                        await websocket.send(json.dumps(resp))
                        await activeConnections[enemyID].send(json.dumps(resp))

            if(msg['actionType'] == 3):
                if userID == 0:
                    resp['status'] = STATUS_NO_USER_ID
                    await websocket.send(json.dumps(resp))
                else:
                    if int(msg['scorePlayer1']) >= 9 or int(msg['scorePlayer2']) >= 9:
                        gameOver[userID] = True

                    enemyID = 0
                    playerNo = -1
                    for m in matches:
                        if m[0] == userID or m[1] == userID:
                            if m[0] == userID:
                                enemyID = m[1]
                                playerNo = 0
                            else:
                                enemyID = m[0]
                                playerNo = 1

                    if gameOver[userID] and gameOver[enemyID]:
                        if gameVerdict[userID]:
                            continue

                        gameVerdict[userID] = True
                        gameVerdict[enemyID] = True

                        winner = 0
                        if int(msg['scorePlayer1']) >= 9:
                            winner = 0
                        else:
                            winner = 1
                        finMsg = {'status': STATUS_FINISH_GAME}

                        if playerNo == winner:
                            finMsg['finalResult'] = 'You win!'
                            await websocket.send(json.dumps(finMsg))
                            finMsg['finalResult'] = 'You lost!'
                            await activeConnections[enemyID].send(json.dumps(finMsg))
                            changeScoreDB(userID, enemyID)
                        else:
                            finMsg['finalResult'] = 'You lost!'
                            await websocket.send(json.dumps(finMsg))
                            finMsg['finalResult'] = 'You win!'
                            await activeConnections[enemyID].send(json.dumps(finMsg))
                            changeScoreDB(enemyID, userID)

                        continue

                    cnt = 0
                    for i in range(0, 200):
                        for j in range(0, 200):
                            picture[i][j] = int(msg['picture'][cnt:(cnt+3)])
                            cnt = cnt + 3

                    coord = model.inference_frame(picture)
                    if coord != -1:
                        lastCoord[userID] = coord
                        print('AM DETECTAT MANA LUI ' + str(userID) + ' la ' + str(coord))

                    frameNo[userID] = frameNo[userID] + 1
                    #ballCoord[userID] = (msg['ballX'], msg['ballY'])

                    if frameNo[userID] == frameNo[enemyID]:
                        coords = {}
                        #ballDif = abs(ballCoord[userID][0] - ballCoord[enemyID][0]) + abs(ballCoord[userID][1] - ballCoord[enemyID][1])

                        if playerNo == 0:
                            coords = {'status': STATUS_OK, 'player1coord': lastCoord[userID], 'player2coord': lastCoord[enemyID]}
                            #if ballDif > 200:
                            #    coords['ballX'] = ballCoord[userID][0]
                            #    coords['ballY'] = ballCoord[userID][1]
                        else:
                            coords = {'status': STATUS_OK, 'player2coord': lastCoord[userID], 'player1coord': lastCoord[enemyID]}
                            #if ballDif > 200:
                            #    coords['ballX'] = ballCoord[enemyID][0]
                            #    coords['ballY'] = ballCoord[enemyID][1]

                        await websocket.send(json.dumps(coords))
                        await activeConnections[enemyID].send(json.dumps(coords))

        except:
            if userID in activeConnections:
                del activeConnections[userID]
            if userID in readyToPlay:
                readyToPlay.remove(userID)
            if userID in lastCoord:
                del lastCoord[userID]
            if userID in frameNo:
                del frameNo[userID]
            #if userID in ballCoord:
            #    del ballCoord[userID]
            if userID in gameOver:
                del gameOver[userID]
            if userID in gameVerdict:
                del gameVerdict[userID]

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
