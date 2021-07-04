const avengersNames = [
    "Thor",
    "Cap",
    "Tony Stark",
    "Black Panther",
    "Black Widow",
    "Hulk",
    "Spider-Man",
]
let randomName = avengersNames[Math.floor(Math.random() * avengersNames.length)]

const main = async () => {
    // When a participant joins a conference with audio and/or video enabled,
    //an event named streamAdded is emitted to all other participants.
    /* Events handlers */
    VoxeetSDK.conference.on('streamAdded', (participant, stream) => {
        if (stream.type === 'ScreenShare') {
            return;
        }

        console.log("streamAdded, ", participant, stream)

        if (stream.getVideoTracks().length) {
            addVideoNode(participant, stream);
        }
    });
    VoxeetSDK.conference.on('streamUpdated', (participant, stream) => {
        if (stream.type === 'ScreenShare') {
            return;
        }
        console.log("streamUpdated, ", participant, stream)

        if (stream.getVideoTracks().length) {
            addVideoNode(participant, stream);
        } else {
            removeVideoNode(participant);
        }
    });

    VoxeetSDK.conference.on('streamRemoved', (participant, stream) => {
        console.log("streamRemoved, ", participant, stream)
        removeVideoNode(participant)
    })

    VoxeetSDK.initialize(
        "f504EAEErLVdJ2GsaNJyRw==",
        "17j_SclvklqaWBA0k9umFaq5eQyigQs3nAiEhgcAZXg="
    )

    try {
        // Open the session here !!!!
        await VoxeetSDK.session.open({
            name: randomName
        })
        initUI();
    } catch (e) {
        alert('Something went wrong : ' + e)
    }
}

main()
