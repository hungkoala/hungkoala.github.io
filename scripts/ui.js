// ui.js

var lblDolbyVoice;
var nameMessage;
var leaveButton;
var joinButton;
var startVideoBtn;
var stopVideoBtn;
var startAudioBtn;
var stopAudioBtn;
var conferenceAliasInput;

const initUI = () => {
    lblDolbyVoice = document.getElementById('label-dolby-voice');
    nameMessage = document.getElementById("name-message")
    leaveButton = document.getElementById('leave-btn')
    joinButton = document.getElementById('join-btn');
    startVideoBtn = document.getElementById('start-video-btn')
    stopVideoBtn = document.getElementById('stop-video-btn')
    startAudioBtn = document.getElementById('start-audio-btn');
    stopAudioBtn = document.getElementById('stop-audio-btn');
    conferenceAliasInput = document.getElementById('alias-input');

    nameMessage.innerHTML = `You are logged in as ${currentUser.name}`
    joinButton.disabled = false;

    joinButton.onclick = () => {
        // Default conference parameters
        // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/conferenceparameters
        let conferenceParams = {
            liveRecording: false,
            rtcpMode: "max", // worst, average, max
            ttl: 0,
            videoCodec: "H264", // H264, VP8
            dolbyVoice: true
        };

        // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/conferenceoptions
        let conferenceOptions = {
            alias: conferenceAliasInput.value,
            params: conferenceParams
        };

        // 1. Create a conference room with an alias
        VoxeetSDK.conference
            .create(conferenceOptions)
            .then((conference) => {
                return join(conference)
            })
            .catch((e) => console.log(e));
    };

    leaveButton.onclick = () => {
        VoxeetSDK.conference
            .leave()
            .then(() => {
                joinButton.disabled = false
                leaveButton.disabled = true

                startVideoBtn.disabled = true;
                stopVideoBtn.disabled = true

                startAudioBtn.disabled = true;
                stopAudioBtn.disabled = true;
            })
            .catch(err => {
                console.log(err)
            })
    }

    startVideoBtn.onclick = () => {
        VoxeetSDK.conference
            .startVideo(VoxeetSDK.session.participant)
            .then(() => {
                startVideoBtn.disabled = true
                stopVideoBtn.disabled = false
            })
    }

    stopVideoBtn.onclick = () => {
        VoxeetSDK.conference
            .stopVideo(VoxeetSDK.session.participant)
            .then(() => {
                stopVideoBtn.disabled = true
                startVideoBtn.disabled = false
            })
    }

    startAudioBtn.onclick = () => {
        // Start sharing the Audio with the other participants
        VoxeetSDK.conference.startAudio(VoxeetSDK.session.participant)
            .then(() => {
                startAudioBtn.disabled = true;
                stopAudioBtn.disabled = false;
            })
            .catch((e) => console.log(e));
    };

    stopAudioBtn.onclick = () => {
        // Stop sharing the Audio with the other participants
        VoxeetSDK.conference.stopAudio(VoxeetSDK.session.participant)
            .then(() => {
                stopAudioBtn.disabled = true;
                startAudioBtn.disabled = false;
            })
            .catch((e) => console.log(e));
    };
}
/*
  Creates a video node element on the video-container <div> for a participant with userId
*/
const addVideoNode = (participant, stream) => {
    let participantNode = document.getElementById('participant-' + participant.id);

    if (!participantNode) {
        participantNode = document.createElement('div');
        participantNode.setAttribute('id', 'participant-' + participant.id);


        let videoNode = document.createElement('video');

        videoNode.setAttribute('id', 'video-' + participant.id);
        videoNode.setAttribute('height', 400);
        videoNode.setAttribute('width', 400);
        videoNode.setAttribute("playsinline", true);
        videoNode.muted = true;
        videoNode.setAttribute("autoplay", 'autoplay');

        const info = participant.info || {
            sdkVersion: '',
            name: ''
        };

        const nameDiv = document.createElement("div");
        const nameContent = document.createTextNode(`Name: ${info.name}, sdk: ${info.sdkVersion}`);
        nameDiv.appendChild(nameContent);

        participantNode.appendChild(videoNode)
        participantNode.appendChild(nameDiv)

        const videoContainer = document.getElementById('video-container');
        videoContainer.appendChild(participantNode);

        console.log("participant", participant)

        navigator.attachMediaStream(videoNode, stream);
    }
};

const removeVideoNode = (participant) => {
    const videoContainer = document.getElementById('video-container');
    let participantNode = document.getElementById("participant-" + participant.id)

    if (participantNode && videoContainer) {
        videoContainer.removeChild(participantNode)
    }
}

const leave = () => {
    return VoxeetSDK.conference
        .leave()
        .then(() => {
            joinButton.disabled = false
            leaveButton.disabled = true

            startVideoBtn.disabled = true;
            stopVideoBtn.disabled = true

            startAudioBtn.disabled = true;
            stopAudioBtn.disabled = true;
            return true;
        })
        .catch(err => {
            console.log(err)
        })
}

const join = (conference) => {
    // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/joinoptions
    const joinOptions = {
        constraints: {
            audio: true,
            video: false
        },
        simulcast: false
    };

    // 2. Join the conference
    return VoxeetSDK.conference
        .join(conference, joinOptions)
        .then((conf) => {
            console.log('join ...', conf);

            lblDolbyVoice.innerHTML = `Dolby Voice is ${conf.params.dolbyVoice ? 'On' : 'Off'}.`;

            // conferenceAliasInput.disabled = true;
            joinButton.disabled = true;
            leaveButton.disabled = false;

            startVideoBtn.disabled = false;
            stopVideoBtn.disabled = true

            startAudioBtn.disabled = true;
            stopAudioBtn.disabled = false;

            // startScreenShareBtn.disabled = false;
            // startRecordingBtn.disabled = false;

            return conf;
        })
        .catch((e) => console.log(e));
}