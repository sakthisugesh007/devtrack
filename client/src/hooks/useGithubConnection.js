import { useState, useEffect } from 'react';

export const useGithubConnection = () => {
    const [connectionStatus, setConnectionStatus] = useState({
        connected: false,
        loading: true,
        error: null,
        githubUsername: null,
        avatarUrl: null,
        isMockAccount: false,
        needsReconnect: false,
        lastSynced: null
    });

    const checkConnection = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/github/connection-status', {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setConnectionStatus({
                    ...data,
                    loading: false,
                    error: null
                });
            } else {
                setConnectionStatus(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to check connection'
                }));
            }
        } catch (error) {
            setConnectionStatus(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    return { ...connectionStatus, refreshConnection: checkConnection };
};
