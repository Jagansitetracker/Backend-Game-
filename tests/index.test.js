const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';
const axios = require('axios');

describe("Authentication",  () => {
    test('User can sign in with valid credentials only once',  async() => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        expect(response.statusCode).toBe(200);
        const UpdatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        expect(UpdatedResponse.statusCode).toBe(400);
    });
    test('User sign up request fails id the username is empty',  async() => {
        const username = '';
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        expect(response.statusCode).toBe(400);
    }
    );
    test('Signin succeds if the username and password are correct',  async() => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        expect(response.statusCode).toBe(200);
        const UpdatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        expect(UpdatedResponse.statusCode).toBe(200);
        expect(UpdatedResponse.data).toHaveProperty('token');
    }
    );
    test('Signin fails if the username and password are incorrect',  async() => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        expect(response.statusCode).toBe(200);
        const UpdatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password:'wrongpassword'
        })

        expect(UpdatedResponse.statusCode).toBe(401);// could be 401
    }
    );
})

describe("User metaData endPoints",  () => {
    let token="";
    let avatarId="";

    beforeAll(async () => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })


        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            type:"admin"
        })
        token = Updatedresponse.data.token;
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "name": "avatar"
        });
        avatarId = avatarResponse.data.avatarId;
    });

    test('User cant update their metadata with a wrong avatar ID',  async() => {
       const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId:"123123"
       },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
       expect(response.statusCode).toBe(400);
    }
    );

    test('User can update their metadata with a correct avatar ID',  async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
       },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
       expect(response.statusCode).toBe(400);
    });

    test('User forgets their authorization headers',  async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId
        });
        expect(response.statusCode).toBe(403);
    }
    );
})

 describe('User avatar information', () => {
    let token;
    let avatarId;
    let userId;
    beforeAll(async () => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        userId = response.data.userId;
        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            type:"admin"
        })
        token = Updatedresponse.data.token;
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "name": "avatar"
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        avatarId = avatarResponse.data.avatarId;
    });

    test('Get back avatar information for a user', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBeDefined();
    }
    );

    test('Available avatars lists the recently created avatars', async () => {
        const response =await axios.post(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(x=>(x.id===avatarId));
        expect(currentAvatar).toBeDefined();
    });
})

describe('Space information', () => {
    let mapId;
    let element1Id;
    let element2Id;
    let userToken;
    let userId;
    let adminId;
    let adminToken;
    beforeAll(async () => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        adminId = response.data.userId;
        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            type:"admin"
        })
        adminToken  = Updatedresponse.data.token;
        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username:username+"-user",
            password,
            type:"user"
        })

        userId = UserResponse.data.userId;
        const UserUpdatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username:username+"-user",
            password,
            type:"user"
        })
        userToken  = UserUpdatedresponse.data.token;
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        element1Id = element1.data.id;
        element2Id = element2.data.id;
        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://example.com/avatar.jpg",
            "dimensions":"100x200",
            "defaultElement": [{
                elementId:element1Id,
                x:20,
                y:20
            },
            {
                elementId:element1Id,
                x:18,
                y:20
            },
        {
            elementId:element2Id,
            x:18,
            y:20
        },
        {
            elementId:element2Id,
            x:17,
            y:20
        }],
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        mapId = map.id;
    });

    test('User is able to create a space', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",
            "mapId": mapId
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.spaceId).toBeDefined();
    });

    test('User is able to create a space without mapId', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",

        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.spaceId).toBeDefined();
    });

    test('User is not able to create a space without mapId and dimensions', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",

        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.statusCode).toBe(400);
    });

    test('User should not be able to delete an invalid space', async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/12312`);
        expect(response.statusCode).toBe(400);
    });

    test('User should be able to delete an his space', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(deleteResponse.statusCode).toBe(200);

    });

    test('User should not be able to delete a space created vy another user',async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        expect(deleteResponse.statusCode).toBe(403);
    });

    test('Admin has no spaces initially', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/spaces/all`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        expect(response.data.spaces.length).toBe(0);
    });

    test('Admin has 1 space initially', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });

        const getResponse = await axios.get(`${BACKEND_URL}/api/v1/spaces/all`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        expect(getResponse.data.spaces.length).toBe(1);
    });

})

describe('Arena endPoints', () => {
    let mapId;
    let element1Id;
    let element2Id;
    let userToken;
    let userId;
    let adminId;
    let adminToken;
    let spaceId;
    beforeAll(async () => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        adminId = response.data.userId;
        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username,
            password,
            type:"admin"
        })
        adminToken  = Updatedresponse.data.token;
        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username+"-user",
            password,
            type:"user"
        })

        userId = UserResponse.data.userId;
        const UserUpdatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username+"-user",
            password,
            type:"user"
        })
        userToken  = UserUpdatedresponse.data.token;
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        element1Id = element1.data.elementId;
        element2Id = element2.data.elementId;
        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://example.com/avatar.jpg",
            "dimensions":"100x200",
            "defaultElement": [{
                elementId:element1Id,
                x:20,
                y:20
            },
            {
                elementId:element1Id,
                x:18,
                y:20
            },
        {
            elementId:element2Id,
            x:18,
            y:20
        },
        {
            elementId:element2Id,
            x:17,
            y:20
        }],
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        mapId = map.id;
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",
            "mapId": map.id
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        spaceId = space.data.spaceId;

    });

    test('Incorrect space Id returns a 400 error', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123123123`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.statusCode).toBe(400);
    }
    );

    test('correct space Id returns elements', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(2);
    }
    );

    test('Delete endPoint is able to delete an element', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        const newResponse =   await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            },
            data:{
                elementId:response.data.elements[0].id,
                spaceId
            }
        });
        const getResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(getResponse.data.elements.length).toBe(2);
    }
    );

    test('Adding an element works as expected', async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            elementId:element1Id,
            spaceId,
            x:50,
            y:20
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.elements.length).toBe(3);
    }
    );
})

describe('Admin EndPoints',() => {
    let adminToken;
    let adminId;
    let userToken;
    let userId;


    beforeAll(async () => {
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        adminId = response.data.userId;
        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username,
            password,
            type:"admin"
        })
        adminToken  = Updatedresponse.data.token;
        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username+"-user",
            password,
            type:"user"
        })

        userId = UserResponse.data.userId;
        const UserUpdatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username+"-user",
            password,
            type:"user"
        })
        userToken  = UserUpdatedresponse.data.token;

    });

    test('User is not able to hit admin endPoints', async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(elementResponse.statusCode).toBe(403);

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://example.com/avatar.jpg",
            "dimensions":"100x200",
            "defaultElement": [],
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });


        const createAvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "name": "avatar"
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        const updatetElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://example.com/avatar.jpg",

        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        expect(mapResponse.statusCode).toBe(403);
        expect(createAvatarResponse.statusCode).toBe(403);
        expect(updatetElementResponse.statusCode).toBe(403);

    })

    test('Admin is able to updatet the imageURl for an element', async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        const elementId = elementResponse.data.elementId;
        const response = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`, {
            "imageUrl": "https://example.com/avatar.jpg",

        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        expect(response.statusCode).toBe(200);
    })


})

describe('WebSocket tests', () => {
    let adminToken;
    let adminUserId;
    let userToken;
    let userId;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndGetLatestMessages(messageArray) {
        return new Promise((resolve) => {
            const observer = new MutationObserver(() => {
                if (messageArray.length > 0) {
                    observer.disconnect();
                    resolve(messageArray.pop());
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    function setupHTTP(){
        const username = 'jj'+Math.floor(Math.random() * 1000);
        const password = 'password';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })

        adminId = response.data.userId;
        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username,
            password,
            type:"admin"
        })
        adminToken  = Updatedresponse.data.token;

        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username+"-user",
            password,
            type:"user"
        })
        userId = UserResponse.data.userId;
        const UserUpdatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username+"-user",
            password,
            type:"user"
        })
        userToken  = UserUpdatedresponse.data.token;
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://example.com/avatar.jpg",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        element1Id = element1.data.elementId;
        element2Id = element2.data.elementId;


        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://example.com/avatar.jpg",
            "dimensions":"100x200",
            "defaultElement": [{
                elementId:element1Id,
                x:20,
                y:20
            },
            {
                elementId:element1Id,
                x:18,
                y:20
            },
        {
            elementId:element2Id,
            x:18,
            y:20
        },
        {
            elementId:element2Id,
            x:17,
            y:20
        }],
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        mapId = map.data.id;
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name":"Test",
            "dimensions":"100x200",
            "mapId": mapId
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        spaceId = space.data.spaceId;
    }

    async function setupWebSocket() {
        ws1 = new WebSocket(WS_URL)
        ws2 = new WebSocket(WS_URL)
        await new Promise((resolve) => {
            ws1.onopen = resolve;
        }
        );
        await new Promise((resolve) => {
            ws2.onopen = resolve;
        }
        );
        ws1.onmessage = (event) => {
            const message = JSON.parse(event.data);
            ws1Messages.push(message);
        }
        ws2.onmessage = (event) => {
            const message = JSON.parse(event.data);
            ws2Messages.push(message);
        }
        ws1.send(JSON.stringify({
            type: 'join',
            payload: {
                token: adminToken,
                spaceId: spaceId
            }
        }));
        ws2.send(JSON.stringify({
            type: 'join',
            payload: {
                token: userToken,
                spaceId: spaceId
            }
        }));



        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;

        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;
    }

    beforeAll(async () => {
        await setupHTTP();
        await setupWebSocket();

    });

    test('Get back ack  for joining the space', async () => {
        const message1 = await waitForAndGetLatestMessages(ws1Messages);
        const message2 = await waitForAndGetLatestMessages(ws2Messages);
        expect(message1.type).toBe('ack');
        expect(message2.type).toBe('ack');
    }
    );

    test('User shoudl not be able to move across the coundaries of the wall', async () => {
        ws1.send(JSON.stringify({
            type: 'movement-rejected',
            payload: {
                x: 1000000,
                y: 1000000
            }
        }));
        const message = await waitForAndGetLatestMessages(ws1Messages);
        expect(message.type).toBe('movement-rejected');
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    }
    );

    test('Correct movement to be broadcasted to other users', async () => {
        ws1.send(JSON.stringify({
            type: 'movement',
            payload: {
                x: 50,
                y: 50,
                userId: adminId
            }
        }));
        const message = await waitForAndGetLatestMessages(ws2Messages);
        expect(message.type).toBe('movement');
        expect(message.payload.x).toBe(50);
        expect(message.payload.y).toBe(50);
    }
    );

    test('If a User leaves the space the other user should be notified', async () => {
        ws1.close();
        const message = await waitForAndGetLatestMessages(ws2Messages);
        expect(message.type).toBe('user-left');
        expect(message.payload.userId).toBe(adminId);
    });
    
})