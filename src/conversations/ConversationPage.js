import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketIoClient from 'socket.io-client';
import { useUser } from '../auth';

export const ConversationPage = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInputValue, setMessageInputValue] = useState('');
    const { id: conversationId } = useParams();
    const { user } = useUser();

    useEffect(() => {
        const establishSocketConnection = async () => {
            const socket = socketIoClient('http://127.0.0.1:8080', {
                query: {
                    conversationId,
                    token: await user.getIdToken(),
                }
            });
            setSocket(socket);

            socket.on('heresYourConversation', conversation => {
                console.log('Initial messages loaded...');
                setMessages(conversation.messages);
            });

            socket.on('messagesUpdated', data => {
                console.log('Messages updated...');
                setMessages(data);
            });

            return () => socket.disconnect();
        }
        
        if (user) {
            establishSocketConnection();
        }
    }, [user, conversationId]);

    const postMessage = async text => {
        socket.emit('postMessage', {
            text: messageInputValue,
            conversationId,
            query: {
                conversationId,
                token: await user.getIdToken(),
            },
        });
        setMessageInputValue('');
    }

    return (
        <div>
            {messages.map(message => (
                <div key={message._id}>
                    <h3>{message.postedBy.name}</h3>
                    <p>{message.text}</p>
                </div>
            ))}
            <input
                type="text"
                value={messageInputValue}
                onChange={e => setMessageInputValue(e.target.value)} />
            <button onClick={postMessage}>Post new message</button>
        </div>
    );
}