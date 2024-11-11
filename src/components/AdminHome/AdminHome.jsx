// src/components/AdminHome/userdata.js

import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/firebase'; // Jalur relatif ke firebase.js
import { CardDefault } from './SrCard';

export function UsersData() {
    const [data, setData] = useState({});

    useEffect(() => {
        const usersRef = ref(database, 'UsersData/nKwBn0cBqkMZ7eZepchshO2bUQo1');
        
        // Mengambil data dari Realtime Database
        onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            setData(usersData);
        });

        // Cleanup function (optional)
        return () => {
            // Anda bisa menambahkan logika cleanup jika diperlukan
        };
    }, []);

    return (
        <div>
            <h1>Users Data</h1>
            {Object.keys(data).map((srKey) => (
                <CardDefault key={srKey} srData={data[srKey]} srKey={srKey} />
            ))}
        </div>
    );
}