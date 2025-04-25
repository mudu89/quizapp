import json
from fastapi import WebSocket, WebSocketDisconnect
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.host_conncetion: WebSocket = None
        self.top_time_taken = {}  # Dictionary to store top 3 minimum time_taken values

    def update_top_time_taken(self, session_id, player_id, time_taken):
        if session_id not in self.top_time_taken:
            self.top_time_taken[session_id] = {}

        # Add the player_id to the corresponding time_taken key
        if time_taken in self.top_time_taken[session_id]:
            self.top_time_taken[session_id][time_taken].append(player_id)
        else:
            self.top_time_taken[session_id][time_taken] = [player_id]

        # Keep only the 3 minimum time_taken values
        # sorted_times = sorted(self.top_time_taken[session_id].keys())[:3]
        # self.top_time_taken[session_id] = {time: self.top_time_taken[session_id][time] for time in sorted_times}

    async def connect(self, websocket: WebSocket):
        try:
            await websocket.accept()
            msg = await websocket.receive_json()
            logger.info(f"Received message: {msg}")
            type = msg['action']
            session = msg['session_id']
            data = msg.get('data', None)
            if type == 'join':
                if session in self.active_connections.keys():
                    self.active_connections[session].append(websocket)
                    logger.info(f"Session {session} joined")
                    #await self.send_personal_message("You are now connected to the server", websocket)
                    await self.host_conncetion.send_json({"action": "joined", "session_id": session, "data": data })
                    await self.broadcast(session, {"action": "joined", "session_id": session, "data": data })
                else:
                    logger.error(f"Session {session} does not exist")
                    await self.send_personal_message({"action": "end", "session_id": session, "data": {"message": "No active quiz found"}}, websocket)
                    raise WebSocketDisconnect
            elif type == 'start':
                logger.info(f"Session {session} started")
                self.active_connections[session] = []
                self.host_conncetion = websocket
                await self.broadcast(session, {"message": "Session has started"})
        except WebSocketDisconnect:
            logger.warning("WebSocket disconnected during connection setup")
            self.disconnect(websocket)

    def disconnect(self, websocket: WebSocket):
        if self.host_conncetion == websocket:
            self.host_conncetion = None
        else:
            for session_id in self.active_connections:
                if websocket in self.active_connections[session_id]:
                    self.active_connections[session_id].remove(websocket)


    async def disconnect_all(self):
        for session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.close()
        await self.host_conncetion.close()
        self.host_conncetion = None
        self.active_connections.clear()

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, session_id, message: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                logger.info(f"Broadcasting message to session {connection}: {message}")
                await connection.send_json(message)