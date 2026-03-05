import React from 'react';
import MainLayout from '@/components/core/MainLayout';
import { MessagingCenter } from '@/components/messaging/MessagingCenter';
import { motion } from 'framer-motion';

const MessagesPage: React.FC = () => {
    return (
        <MainLayout className="bg-slate-50/50 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto h-[700px] md:h-[800px]"
                >
                    <MessagingCenter />
                </motion.div>
            </div>
        </MainLayout>
    );
};

export default MessagesPage;
