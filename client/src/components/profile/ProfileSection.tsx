import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call the API
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated",
      variant: "default",
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">User Profile</h2>
        <p className="text-zinc-400 text-sm">Edit your personal information and account details</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-950 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-1">Personal Information</h3>
            <p className="text-zinc-400 text-sm">Update your personal details</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-950 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-1">Change Password</h3>
            <p className="text-zinc-400 text-sm">Update your password</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Current password"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New password"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;