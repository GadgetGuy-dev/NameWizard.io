import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSection from '@/components/profile/ProfileSection';
import ApiKeysSection from '@/components/profile/ApiKeysSection';
import ThemeSection from '@/components/profile/ThemeSection';
// Removed AgentsSection and AiFeaturesSection as we're consolidating them into dedicated pages

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <MainLayout>
      <div className="py-4">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account preferences and settings</p>
      </div>

      <div className="bg-zinc-950 rounded-lg p-6">
        <Tabs 
          defaultValue="profile" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="apiKeys">API Keys</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
          
          <TabsContent value="apiKeys">
            <ApiKeysSection />
          </TabsContent>
          
          <TabsContent value="theme">
            <ThemeSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;