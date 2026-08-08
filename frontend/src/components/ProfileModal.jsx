import React, { useState } from 'react';
import { uploadFile, updateProfile } from '../services/api';

const ProfileModal = ({ isOpen, onClose, currentUser, onProfileUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg");

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileObj = e.target.files[0];
      try {
        setUploading(true);
        // Upload file to server
        const res = await uploadFile(fileObj);
        const newAvatarUrl = res.url;
        
        // Update local state for immediate preview
        setAvatarUrl(newAvatarUrl);

        // Update profile in backend
        await updateProfile({ avatarUrl: newAvatarUrl });

        // Update global App state
        onProfileUpdated(newAvatarUrl);
        
        alert('Cập nhật ảnh đại diện thành công!');
      } catch (err) {
        console.error("Failed to upload avatar", err);
        
        // Fallback for local testing without backend
        const localUrl = URL.createObjectURL(fileObj);
        setAvatarUrl(localUrl);
        onProfileUpdated(localUrl);
        
        // Save to local storage for persistence across reloads in offline mode
        const storedUsers = JSON.parse(localStorage.getItem('evshare_users') || '[]');
        const updatedUsers = storedUsers.map(u => u.id === currentUser?.id ? { ...u, avatarUrl: localUrl } : u);
        localStorage.setItem('evshare_users', JSON.stringify(updatedUsers));
        
        alert('Cập nhật ảnh đại diện thành công (chế độ offline)!');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-ink">Hồ sơ cá nhân</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <i className="ph ph-x"></i>
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-4">
              <img 
                src={avatarUrl} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md transition-all group-hover:brightness-75"
                alt="Avatar"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ph ph-camera text-2xl text-white drop-shadow-md"></i>
              </div>
              
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                  <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <h4 className="text-xl font-bold text-ink mb-1">{currentUser?.name || "Người dùng"}</h4>
            <p className="text-sm text-slate-500 mb-6">{currentUser?.username || "---"}</p>
            
            <div className="w-full bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Vai trò</span>
                <span className="font-semibold text-ink">
                  {currentUser?.role === 'ADMIN' ? 'Quản trị viên' : (currentUser?.isGroupLeader ? 'Trưởng nhóm xe' : 'Thành viên góp vốn')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Số dư ví</span>
                <span className="font-bold text-brand-600">{new Intl.NumberFormat('vi-VN').format(currentUser?.walletBalance || 0)} ₫</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tỷ lệ sở hữu xe</span>
                <span className="font-semibold text-ink">{currentUser?.ownershipPercentage || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
