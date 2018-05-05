import asyncio
import websockets
import json
import sqlite3

ADDRESS = '192.168.0.207'
PORT = 9950

activeConnections = {}
readyToPlay = []
matches = []
dbConn = None

def getUserID(username, password):
    cursor = dbConn.cursor()

    sql_command = 'SELECT userID FROM users WHERE username = \"' + username + '\" AND password = \"' + password + '\"'
    cursor.execute(sql_command)
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

    sql_command = 'INSERT INTO users VALUES (' + str(userID) + ', \"' + username + '\", \"' + email + '\", \"' + password + '\", 0, 0)'
    cursor.execute(sql_command)

    try:
        sql_command = 'COMMIT'
        cursor.execute(sql_command)
    except:
        pass

    return userID

def getUserData(userID):
    cursor = dbConn.cursor()

    sql_command = 'SELECT username, email, win, loss FROM users WHERE userID = ' + str(userID)
    cursor.execute(sql_command)
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
    resp = {}

    while 1:
        ret = ""
        try:
            ret = await websocket.recv()
            msg = json.loads(ret)

            print(msg)

            if(msg['actionType'] == 0):
                userID = registerUser(msg['username'], msg['email'], msg['password'])
                if userID != 0:
                    print('User-ul ' + str(userID) + ' (' + msg['username'] + ') a fost creat')
                    activeConnections[userID] = websocket
                    resp = getUserData(userID)
                    resp['status'] = 'OK'
                else:
                    resp['status'] = 'INVALID_CREDENTIALS'
                await websocket.send(json.dumps(resp))

            if(msg['actionType'] == 1):
                userID = getUserID(msg['username'], msg['password'])
                if userID != 0:
                    print('User-ul ' + str(userID) + ' (' + msg['username'] + ') s-a conectat')
                    activeConnections[userID] = websocket
                    resp = getUserData(userID)
                    resp['status'] = 'OK'
                else:
                    resp['status'] = 'INVALID_CREDENTIALS'
                await websocket.send(json.dumps(resp))

            if(msg['actionType'] == 2):
                if userID == 0:
                    resp['status'] = 'NO_USER_ID'
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
                        resp['status'] = 'OK'
                        await websocket.send(json.dumps(resp))
                        await activeConnections[enemyID].send(json.dumps(resp))
        except:
            if userID in activeConnections:
                del activeConnections[userID]
            if userID in readyToPlay:
                readyToPlay.remove(userID)
            # sterge userul din matches
            # reintoarce adversarul sau in readyToPlay
            print('User-ul ' + str(userID) + ' s-a deconectat')
            break


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

print('Server started...')

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
