'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Camera, ShieldCheck, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PushNotifications } from '@capacitor/push-notifications';
import { Camera as CapacitorCamera } from '@capacitor/camera';

interface PermissionsSlideProps {
    onComplete?: () => void;
}

const PermissionsSlide: React.FC<PermissionsSlideProps> = ({ onComplete }) => {
    const [notificationsGranted, setNotificationsGranted] = useState(false);
    const [cameraGranted, setCameraGranted] = useState(false);

    const requestNotifications = async () => {
        try {
            const result = await PushNotifications.requestPermissions();
            if (result.receive === 'granted') {
                setNotificationsGranted(true);
            }
        } catch (e) {
            console.error('Permission Error:', e);
        }
    };

    const requestCamera = async () => {
        try {
            const result = await CapacitorCamera.requestPermissions();
            if (result.camera === 'granted' || result.photos === 'granted') {
                setCameraGranted(true);
            }
        } catch (e) {
            console.error('Permission Error:', e);
        }
    };

    const allGranted = notificationsGranted && cameraGranted;

    return (
        <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-10">

            {/* Friendly Illustration area */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <div className="w-32 h-32 bg-indigo-900/40 rounded-full flex items-center justify-center mb-6 mx-auto border border-indigo-500/30">
                    <ShieldCheck className="w-16 h-16 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Almost Ready!</h2>
                <p className="text-gray-400 max-w-xs mx-auto text-sm">
                    We need access to a few features to make the game work.
                </p>
            </motion.div>

            {/* Permissions List */}
            <div className="w-full max-w-md space-y-4">
                {/* Notification Permission Item */}
                <PermissionItem
                    title="Notifications"
                    description="Get notified when a live quiz starts."
                    icon={Bell}
                    isGranted={notificationsGranted}
                    onGrant={requestNotifications}
                />

                {/* Camera Permission Item */}
                <PermissionItem
                    title="Camera"
                    description="Scan QR codes to join games instantly."
                    icon={Camera}
                    isGranted={cameraGranted}
                    onGrant={requestCamera}
                />
            </div>

            {/* Completion Button */}
            <motion.div
                className="w-full max-w-sm"
                animate={{ opacity: allGranted ? 1 : 0.5, y: allGranted ? 0 : 10 }}
            >
                <Button
                    onClick={onComplete}
                    disabled={!allGranted}
                    size="lg"
                    className={`w-full h-14 text-lg font-bold transition-all duration-300 ${allGranted ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-gray-800 text-gray-400'}`}
                >
                    {allGranted ? "All Set! Let's Go" : "Enable Features to Continue"}
                </Button>
            </motion.div>

        </div>
    );
};

// Helper Component for Individual Permission Item
const PermissionItem = ({ title, description, icon: Icon, isGranted, onGrant }: any) => {
    return (
        <div className="flex items-center justify-between p-4 bg-[#111] rounded-xl border border-gray-800">
            <div className="flex items-center gap-4 text-left">
                <div className={`p-3 rounded-lg ${isGranted ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className={`font-bold ${isGranted ? 'text-green-500' : 'text-white'}`}>{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isGranted ? undefined : onGrant}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isGranted
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
            >
                <AnimatePresence mode='wait'>
                    {isGranted ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1"
                        >
                            <Check className="w-4 h-4" /> Allowed
                        </motion.div>
                    ) : (
                        <motion.div key="allow">Allow</motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default PermissionsSlide;
