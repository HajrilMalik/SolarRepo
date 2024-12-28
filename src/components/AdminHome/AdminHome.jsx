import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Auth Firebase
import { database } from '../../firebase/firebase'; // Jalur relatif ke firebase.js
import { CardDefault } from './SrCard';
import { Card, CardBody } from '@material-tailwind/react';

export function UsersData() {
    const [data, setData] = useState({});
    const [uid, setUid] = useState(null); // State untuk UID pengguna

    useEffect(() => {
        const auth = getAuth();

        // Mendapatkan UID pengguna yang sedang login
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid); // Simpan UID pengguna ke state
            } else {
                console.log('Pengguna belum login');
            }
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);

    useEffect(() => {
        if (!uid) return; // Tunggu UID sebelum memulai query ke database

        const usersRef = ref(database, `UsersData/${uid}`);
        
        // Mengambil data dari Realtime Database berdasarkan UID
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            setData(usersData || {}); // Pastikan data tidak null
        });

        return () => unsubscribe(); // Cleanup listener
    }, [uid]); // Jalankan ulang jika UID berubah

    return (
        <div className='flex justify-center flex-wrap gap-3'>
            <Card color='blue' className="max-h-[600PX] overflow-x-auto">
                <CardBody>
                    <div className="justify-center flex flex-wrap gap-3 w-full">
                        {Object.keys(data).map((srKey) => (
                            <CardDefault key={srKey} srData={data[srKey]} srKey={srKey} />
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
