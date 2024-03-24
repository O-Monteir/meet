
const APP_ID = 'f41cb1258bef40fb8a284e65e15f0a83';
// const TOKEN = process.env.TOKEN;
// const CHANNEL = process.env.CHANNEL;
const TOKEN="007eJxTYKhoFin7I1i1apvSg7yp3O6lN3Ztd5DufXpjk43Irwe/585VYEgzMUxOMjQytUhKTTMxSEuySDSyMEk1M001NE0zSLQwXvbpX2pDICOD8+JHjIwMEAjiszCkpObmMzAAAOogIno="
const CHANNEL="demo"
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
const hostUrl = window.location.origin; // Get the current host URL
let localTracks = [];
let remoteUsers = {};

// Initialize transcription
let isTranscribing = false;
let fullTranscript = '';
const transcriptionContent = document.getElementById('transcription-content');

// Web Speech API Init
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition() || new webkitSpeechRecognition();
recognition.continuous = true;


recognition.onresult = function (event) {
    console.log('Speech recognition result event:', event);
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;
    
    // Construct the message with the timestamp
    var timestamp = new Date().toISOString(); // Get the current timestamp
    var message = `${timestamp} - ${transcript}`;
    
    if (isTranscribing) {
        // Append the recognized speech directly to the transcript
        fullTranscript += message + '\n';
        
        // Update the transcription content
        transcriptionContent.innerHTML = "<b><i>Transcription: </i></b>" + fullTranscript;
        console.log('Transcription updated:', transcriptionContent.innerHTML);
    }
};



// Event listener for speech recognition errors
recognition.onerror = function (event) {
    console.log('Speech recognition error event:', event); // Add this line for debugging
    if (event.error == 'no-speech') {
        console.log('Could you please repeat? I didn\'t get what you\'re saying.');
        recognition.stop();
        recognition.start();
    }
};

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
    let username = document.getElementById('username').value;

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    // Add the code snippet here to ensure the correct order of tracks
    let audioTrack = localTracks.find(track => track.trackMediaType === 'audio');
    let videoTrack = localTracks.find(track => track.trackMediaType === 'video');

    if (audioTrack && videoTrack) {
        // Both audio and video tracks are available
        if (localTracks.indexOf(audioTrack) !== 0 || localTracks.indexOf(videoTrack) !== 1) {
            // Reorder tracks if necessary
            localTracks = [audioTrack, videoTrack];
        }
    } else {
        console.error('Audio or video track not found.');
    }

    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="video-player" id="user-${UID}"></div>
                </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

    localTracks[1].play(`user-${UID}`);
    await client.publish([localTracks[0], localTracks[1]]);

    // Display the user's name
    let userNameElement = document.createElement('div');
    userNameElement.innerText = username;
    userNameElement.classList.add('username-display');
    document.getElementById(`user-container-${UID}`).appendChild(userNameElement);

    // Start transcription
    isTranscribing = true;
    recognition.start();
};

let joinStream = async () => {
    await joinAndDisplayLocalStream();
    document.getElementById('join-btn').style.display = 'none';
    document.getElementById('stream-controls').style.display = 'flex';

    // Generate the link dynamically
    
    const link = `${hostUrl}/video.html`; // Complete meeting link
    console.log('Meeting link:', link);
    document.getElementById('meeting-link').innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.id}`);
        if (player != null) {
            player.remove();
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div> 
                </div>`;

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
        user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    document.getElementById(`user-container-${user.uid}`).remove();
}


let leaveAndRemoveLocalStream = async () => {
    // Stop speech recognition
    recognition.stop();

    // Save the transcript to a file
    saveTranscriptToFile(fullTranscript);

    // Stop and remove local tracks
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop();
        localTracks[i].close();
    }

    // Leave the channel
    await client.leave();

    // Reset UI
    document.getElementById('join-btn').style.display = 'block';
    document.getElementById('stream-controls').style.display = 'none';
    document.getElementById('video-streams').innerHTML = '';
}

function saveTranscriptToFile(transcript) {
    // Get the username
    let username = document.getElementById('username').value;

    // Create a Blob object
    const blob = new Blob([transcript], { type: 'text/plain' });

    // Create a temporary link to trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}_transcript.txt`; // Set filename to username_transcript.txt
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}



let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false);
        e.target.innerText = 'Mic On';
        e.target.style.backgroundColor = 'cadetblue';
        isTranscribing = true; // Start transcription when mic is turned on
        recognition.start(); // Start speech recognition
    } else {
        await localTracks[0].setMuted(true);
        e.target.innerText = 'Mic Off';
        e.target.style.backgroundColor = '#EE4B2B';
        isTranscribing = false; // Stop transcription when mic is turned off
        recognition.stop(); // Stop speech recognition
    }
}


let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false);
        e.target.innerText = 'Camera On';
        e.target.style.backgroundColor = 'cadetblue';
    } else {
        await localTracks[1].setMuted(true);
        e.target.innerText = 'Camera Off';
        e.target.style.backgroundColor = '#EE4B2B';
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream);
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
