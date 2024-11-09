import { DataConnection, Peer } from 'peerjs';

const peerConfig = {
    debug: 3,
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    }
};

let peer = new Peer(peerConfig);
let conn;
let roomPeerId;
let isHost = false;
let participants = new Set();
let numbers = {};
let myNumber = null;
let nickname = '';
let participantData = {};

const createRoomBtn = document.getElementById('createRoomBtn');
const roomId = document.getElementById('roomId');
const joinBtn = document.getElementById('joinBtn');
const shareRoomBtn = document.getElementById('shareRoomBtn');
const numberInput = document.getElementById('numberInput');
const submitBtn = document.getElementById('submitBtn');
const participantsDiv = document.getElementById('participants');
const messages = document.getElementById('messages');
const nicknameInput = document.getElementById('nicknameInput');
const setNicknameBtn = document.getElementById('setNicknameBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const revealBtn = document.getElementById('revealBtn');

createRoomBtn.addEventListener('click', createRoom);
joinBtn.addEventListener('click', joinRoom);
shareRoomBtn.addEventListener('click', shareRoomLink);
submitBtn.addEventListener('click', submitNumber);
nextRoundBtn.addEventListener('click', startNextRound);
setNicknameBtn.addEventListener('click', setNickname);
revealBtn.addEventListener('click', revealNumbers);

peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    checkUrlForRoom();
});

peer.on('error', (error) => {
    console.error('Peer error:', error);
    messages.innerHTML += `<p>Error: ${error}</p>`;
});

function checkUrlForRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedRoom = urlParams.get('room');
    if (encodedRoom) {
        const decodedRoom = atob(encodedRoom);
        roomId.value = decodedRoom;
        joinRoom();
    }
}

function createRoom() {
    const room = generateRoomName();
    roomId.value = room;
    roomPeerId = 'room-' + room;
    console.log('Creating room:', roomPeerId);
    peer.destroy();
    peer = new Peer(roomPeerId, peerConfig);
    setupPeer();
}

function generateRoomName() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function joinRoom() {
    const room = roomId.value;
    if (!room) return;

    roomPeerId = 'room-' + room;
    console.log('Attempting to join room:', roomPeerId);

    conn = peer.connect(roomPeerId);

    conn.on('open', () => {
        console.log('Connected to room as a participant');
        enableNumberInput();
        shareRoomBtn.style.display = 'inline-block';
        conn.send({ type: 'join', peerId: peer.id, nickname: nickname });
    });

    conn.on('data', handleData);

    conn.on('error', (err) => {
        console.error('Connection error:', err);
    });
}

function setupPeer() {
    peer.on('open', (id) => {
        console.log('Created room with peer ID: ' + id);
        isHost = true;
        enableNumberInput();
        shareRoomBtn.style.display = 'inline-block';
        messages.innerHTML += '<p>Created and joined room as host!</p>';
        
        participantData[peer.id] = { nickname: 'HOST', number: null };
        updateParticipantsList();
    });

    peer.on('connection', (connection) => {
        console.log('Received connection from:', connection.peer);
        conn = connection;
        conn.on('open', () => {
            conn.on('data', handleData);
        });
    });
}

function shareRoomLink() {
    const room = roomId.value;
    const encodedRoom = btoa(room);
    const url = `${window.location.origin}${window.location.pathname}?room=${encodedRoom}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Room link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy room link. Please copy it manually: ' + url);
    });
}

function enableNumberInput() {
    numberInput.disabled = false;
    submitBtn.disabled = false;
    nextRoundBtn.style.display = 'none';
}

function submitNumber() {
    const num = parseInt(numberInput.value);
    if (isNaN(num)) {
        alert('Please enter a valid number');
        return;
    }
    myNumber = num;
    numberInput.disabled = true;
    submitBtn.disabled = true;

    participantData[peer.id].number = num;

    checkAllSubmitted();
    updateParticipantsList();

    broadcastToAllPeers({ type: 'number', peerId: peer.id, number: num });
}

function handleData(data) {
    console.log('Received data:', data);

    if (isHost && data.forwardToAll) {
        delete data.forwardToAll;
        broadcastToAllPeers(data);
    }

    if (data.type === 'join') {
        participants.add(data.peerId);
        participantData[data.peerId] = { nickname: data.nickname, number: null };
        updateParticipantsList();
        broadcastParticipantData();
    } else if (data.type === 'participantData') {
        participantData = data.participantData;
        updateParticipantsList();
    } else if (data.type === 'number') {
        participantData[data.peerId].number = data.number;
        checkAllSubmitted();
        updateParticipantsList();
    } else if (data.type === 'allSubmitted') {
        participantData = data.participantData;
        displayResults();
        updateParticipantsList();
    } else if (data.type === 'nextRound') {
        startNextRound();
    } else if (data.type === 'reveal') {
        if (data.participantData) {
            participantData = data.participantData;
            updateParticipantsList();
        }
    }
}

function updateParticipantsList() {
    participantsDiv.innerHTML = '';
    console.log(participantData);
    for (let [peerId, data] of Object.entries(participantData)) {
        const participantEl = document.createElement('div');
        participantEl.className = 'participant';
        const avatarEl = document.createElement('div');
        avatarEl.className = 'avatar';
        avatarEl.textContent = data.number !== null ? 
            (data.revealed ? data.number : '?') : 
            '$';
        const nicknameEl = document.createElement('div');
        nicknameEl.className = 'nickname';
        nicknameEl.textContent = data.nickname || peerId.substr(0, 5).toLocaleUpperCase();
        participantEl.appendChild(avatarEl);
        participantEl.appendChild(nicknameEl);
        participantsDiv.appendChild(participantEl);
    }
}

function broadcastToAllPeers(data) {
    console.log('Broadcasting to all peers:', data);
    if (isHost) {
        Object.values(peer.connections).forEach(connections => {
            connections.forEach(conn => conn.send(data));
        });
    } else if (conn) {
        conn.send({ ...data, forwardToAll: true });
    }
}

function broadcastParticipantData() {
    broadcastToAllPeers({ type: 'participantData', participantData: participantData });
}

function checkAllSubmitted() {
    const allSubmitted = Object.values(participantData).every(data => data.number !== null);
    if (allSubmitted) {
        broadcastToAllPeers({ type: 'allSubmitted', participantData: participantData });
        if (isHost) {
            revealBtn.style.display = 'inline-block';
        }
    }
}

function displayResults() {
    updateParticipantsList();
    messages.innerHTML = '<p>All numbers have been submitted.</p>';
}

function startNextRound() {
    for (let data of Object.values(participantData)) {
        data.number = null;
        data.revealed = false;
    }
    myNumber = null;
    enableNumberInput();
    numberInput.value = '';
    messages.innerHTML = '';
    revealBtn.style.display = 'none';
    updateParticipantsList();
    if (isHost) {
        broadcastToAllPeers({ type: 'nextRound' });
    }
}

function setNickname() {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        participantData[peer.id] = { nickname, number: null };
        broadcastParticipantData();
        updateParticipantsList();
    }
}

function revealNumbers() {
    for (let data of Object.values(participantData)) {
        data.revealed = true;
    }
    updateParticipantsList();
    broadcastToAllPeers({ type: 'reveal', participantData: participantData });
    revealBtn.style.display = 'none';
    nextRoundBtn.style.display = 'inline-block';
}

