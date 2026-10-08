import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  BookOpen,
  Briefcase,
  Sparkles,
  Lock,
  LogOut,
  Save,
  Trash2,
  Sliders,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

const Profile = () => {
  const {
    user,
    updateUserProfile,
    changePassword,
    logout,
    showToast,
    refreshProfile,
  } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    education: '',
    targetRole: '',
    skills: '',
    preferredCategory: 'Technical',
    notificationsEnabled: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      education: user.education || '',
      targetRole: user.targetRole || user.preferred_job_role || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      preferredCategory: 'Technical',
      notificationsEnabled: user.notificationsEnabled ?? true,
    });
  }, [user]);

  useEffect(() => {
    refreshProfile?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateUserProfile({
        name: formData.name,
        education: formData.education,
        targetRole: formData.targetRole,
        skills: skillsArray,
      });
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showToast('Enter current and new password', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Clear local resume cache and session history? (JWT kept)')) {
      localStorage.removeItem('ai_assistant_resume');
      localStorage.removeItem('ai_assistant_history');
      showToast('Local cache cleared. Reloading…', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Profile & Account Settings"
        description="Synced with the Flask profile API. Email cannot be changed here."
        badgeText="Phase 1 Backend"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="card text-center p-6">
            <div className="relative inline-block mx-auto mb-4">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
                }
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-lg mx-auto"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-lg font-heading">
              {user?.name || 'Student'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.targetRole || 'Set your target role'}
            </p>
            <span className="inline-block mt-3 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              {user?.email}
            </span>
          </div>

          <div className="card space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
              Account Actions
            </h4>
            <Button
              variant="secondary"
              fullWidth
              onClick={handleLogout}
              icon={LogOut}
              className="text-rose-600 hover:bg-rose-50 border-rose-100"
            >
              Sign Out
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={handleResetData}
              icon={Trash2}
              className="text-slate-500"
            >
              Clear Local Cache
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="card">
            <h3 className="font-bold text-slate-900 text-base font-heading mb-4 pb-3 border-b border-slate-100">
              Personal & Target Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={User}
                required
              />

              <InputField
                label="Email Address (read-only)"
                name="email"
                type="email"
                value={formData.email}
                onChange={() => {}}
                icon={Mail}
                disabled
              />

              <InputField
                label="Education Degree"
                name="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                icon={BookOpen}
                placeholder="e.g. B.Tech Computer Science (2026)"
              />

              <InputField
                label="Preferred Target Role"
                name="targetRole"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                icon={Briefcase}
                placeholder="e.g. Full Stack Developer"
              />

              <InputField
                label="Preferred Interview Category"
                type="select"
                options={['Technical', 'HR', 'Behavioral', 'Mixed']}
                value={formData.preferredCategory}
                onChange={(e) =>
                  setFormData({ ...formData, preferredCategory: e.target.value })
                }
                icon={Sliders}
              />

              <InputField
                label="Top Skills Keywords"
                name="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                icon={Sparkles}
                helperText="Comma separated skill tags"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSaving}
                  icon={Save}
                  className="shimmer-effect"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          <div className="card">
            <h3 className="font-bold text-slate-900 text-base font-heading mb-4 pb-3 border-b border-slate-100">
              Account Security & Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <InputField
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                icon={Lock}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  icon={Lock}
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  icon={Lock}
                />
              </div>

              <Button type="submit" variant="secondary" loading={isChangingPassword}>
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
