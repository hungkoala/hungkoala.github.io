const participants = [{
        externalId: "12345",
        name: "Thor",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },
    {
        externalId: "12346",
        name: "Cap",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },
    {
        externalId: "12347",
        name: "Tony Stark",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },
    {
        externalId: "12348",
        name: "Black Panther",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },
    {
        externalId: "12349",
        name: "Black Widow",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },
    {
        externalId: "12351",
        name: "Hulk",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },
    {
        externalId: "12352",
        name: "Spider-Man",
        avatarUrl: "https://i2.wp.com/nofiredrills.com/wp-content/uploads/2016/10/myavatar.png?resize=300%2C300&ssl=1"
    },

]
let currentUser = participants[Math.floor(Math.random() * participants.length)]

// const currentUser = participants[0];


const main = async () => {
    window.addEventListener('beforeunload', async (event) => {
        const current = VoxeetSDK.conference.current;
        console.log('beforeunload = ', current);
        if (current) {
            await leave();
        }
    });

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

    VoxeetSDK.notification.on("invitation", async (invitation) => {
        try {
            console.log("on invitation ", invitation);

            const current = VoxeetSDK.conference.current;
            console.log('current = ', current);
            if (current) {
                // show dialog and handle it here 
                // make long pull request to make sure they are still online (not drop)
                console.log('someone is calling you, would you like to answer?');
                await leave();
            }
            const conference = await VoxeetSDK.conference.fetch(invitation.conferenceId);

            if (conference.ErrorResponse) {
                console.log('fetching conference error: ', conference);
                return;
            } else {
                console.log('conference .....', conference);
                const conf = await join(conference);
                console.log("conference joined!");
            }

        } catch (e) {
            console.log('invitation error ', e);
        }
    });

    VoxeetSDK.conference.on("participantUpdated", async (participant) => {
        console.log('participantUpdated ', participant)
        const current = VoxeetSDK.conference.current;
        if (current &&
            participant &&
            participant.info && participant.info.externalId != currentUser.externalId &&
            (participant.status == "Left" || participant.status == "Decline")) {
            console.log('our pair has terminated the call, so terminate at our end too');
            await leave();
        }
    });

    // https://4274e96ab106.ngrok.io

    VoxeetSDK.initialize(
        "OJ7aTWDgTTRkGy6fyz3SgA==",
        "XGIFaWczY7BSyQC0sxg1h4O097UlAgKcLQ4Ut5BdR3M="
    )

    // try {
    //     const data = await fetch('https://4274e96ab106.ngrok.io/bewell-c3d49/asia-east2/app/api/token');
    //     const result = data.json();
    //     const access_token = result.access_token;
    //     console.log('access_token=', access_token);


    //     await VoxeetSDK.initializeToken(access_token, async () => {
    //         try {
    //             const d = await fetch('https://4274e96ab106.ngrok.io/bewell-c3d49/asia-east2/app/api/refresh');
    //             const d1 = d.json()
    //             return d1.access_token;
    //         } catch (e) {
    //             console.log('refresh token error', e)
    //         }
    //     });

    //     // Open the session here !!!!
    //     //await VoxeetSDK.session.open(currentUser)
    //     //initUI();
    // } catch (e) {
    //     alert('Something went wrong : ' + e)
    // }
}

main()