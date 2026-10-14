import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Building2, Sliders, RotateCw, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { TopHeader } from '@/components/common';
import {
  useGetSchoolProfileQuery,
  useGetSchoolSettingsQuery,
  useUpdateSchoolProfileMutation,
  useUpdateSchoolSettingsMutation,
} from '@/store/school';
import { SchoolProfile, SchoolSettingItem } from '@/types';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { InstitutionalIdentitySection } from './school-profile/InstitutionalIdentitySection';
import { CampusContactSection } from './school-profile/CampusContactSection';
import { CampusAddressSection } from './school-profile/CampusAddressSection';
import { SystemSettingsSection } from './school-profile/SystemSettingsSection';

export const SchoolProfileView: React.FC = () => {
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<SchoolProfile | null>(null);
  const [settings, setSettings] = useState<SchoolSettingItem[]>([]);
  const [initialSettings, setInitialSettings] = useState<SchoolSettingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // RTK Query hooks
  const {
    data: rtkProfileData,
    refetch: refetchProfile,
  } = useGetSchoolProfileQuery(activeSchool?.id, { skip: !activeSchool?.id });
  const {
    data: rtkSettingsData,
    refetch: refetchSettings,
  } = useGetSchoolSettingsQuery(activeSchool?.id, { skip: !activeSchool?.id });
  const [updateSchoolProfileMutation] = useUpdateSchoolProfileMutation();
  const [updateSchoolSettingsMutation] = useUpdateSchoolSettingsMutation();

  // Sync RTK Query store data
  useEffect(() => {
    if (rtkProfileData) {
      const p = rtkProfileData.data || rtkProfileData;
      if (p && p.name) {
        setProfile(p);
        setInitialProfile(p);
        setIsLoading(false);
      }
    }
  }, [rtkProfileData]);

  useEffect(() => {
    if (rtkSettingsData) {
      const s = rtkSettingsData.data || rtkSettingsData;
      if (Array.isArray(s) && s.length > 0) {
        setSettings(s);
        setInitialSettings(s);
      }
    }
  }, [rtkSettingsData]);

  const canEdit = hasPermission('school.settings.edit') || hasPermission('school.manage');

  const handleProfileChange = (field: keyof SchoolProfile, value: any) => {
    if (!profile) return;
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSettingChange = (settingKey: string, newValue: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.settingKey === settingKey ? { ...s, settingValue: newValue } : s)),
    );
  };

  const handleResetProfile = () => {
    if (initialProfile) {
      setProfile({ ...initialProfile });
      toast.info('Institutional profile changes reset to original values.');
    }
  };

  const handleResetSettings = () => {
    if (initialSettings) {
      setSettings(initialSettings.map((s) => ({ ...s })));
      toast.info('System configuration changes reset to original values.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !profile) return;
    if (!canEdit) {
      toast.error('You do not have permission to modify school profile.', 'Permission Denied');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateSchoolProfileMutation({
        schoolId: activeSchool.id,
        data: profile,
      }).unwrap();
      const updated = res?.data || res;
      setProfile(updated);
      setInitialProfile(updated);
      refetchProfile();
      toast.success('Institutional profile successfully saved to database.', 'Profile Saved');
    } catch (err: any) {
      toast.error(
        getApiErrorMessage(err, 'Failed to update institutional profile on server.'),
        'Save Error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!activeSchool) return;
    if (!canEdit) {
      toast.error(
        'You do not have permission to modify system configuration.',
        'Permission Denied',
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = settings.map((s) => ({
        settingKey: s.settingKey,
        settingValue: s.settingValue,
      }));
      const res = await updateSchoolSettingsMutation({
        schoolId: activeSchool.id,
        data: payload,
      }).unwrap();
      const updated = res?.data || res;
      setSettings(updated);
      setInitialSettings(updated);
      refetchSettings();
      toast.success(
        'System configuration parameters successfully saved to database.',
        'Settings Saved',
      );
    } catch (err: any) {
      toast.error(
        getApiErrorMessage(err, 'Failed to save system settings on server.'),
        'Save Error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5 text-muted small">
        <Spinner animation="border" size="sm" className="me-2" />
        Loading institutional profile from server...
      </div>
    );
  }

  if (!activeSchool || !profile) {
    return (
      <div className="p-4 text-center text-muted small">
        No active campus selected. Please select a school from the header switcher.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* TopHeader Component (MANDATORY standard) */}
      <TopHeader
        title="Institutional Profile"
        icon={Building2}
        subtitle="Campus identity, accreditation, official contact details, and system configuration parameters."
        badges={[
          { bg: 'primary', label: profile.code || activeSchool.code },
          {
            bg: profile.status === 'ACTIVE' ? 'success' : 'warning',
            label: profile.status || 'ACTIVE',
          },
          { bg: 'secondary', label: activeAcademicYear?.name || 'Active Session' },
        ]}
        actions={[
          {
            name: 'School Profile',
            icon: Building2,
            action: () => setActiveTab('profile'),
            variant: activeTab === 'profile' ? 'secondary' : 'outline-secondary',
          },
          {
            name: 'System Settings',
            icon: Sliders,
            action: () => setActiveTab('settings'),
            variant: activeTab === 'settings' ? 'secondary' : 'outline-secondary',
          },
        ]}
      />

      {/* Tab 1: Institutional Profile */}
      {activeTab === 'profile' && (
        <Form id="profile-form" onSubmit={handleSaveProfile} className="d-flex flex-column gap-3">
          <InstitutionalIdentitySection
            profile={profile}
            canEdit={canEdit}
            isDark={isDark}
            onChange={handleProfileChange}
          />

          <CampusContactSection
            profile={profile}
            canEdit={canEdit}
            isDark={isDark}
            onChange={handleProfileChange}
          />

          <CampusAddressSection
            profile={profile}
            canEdit={canEdit}
            isDark={isDark}
            onChange={handleProfileChange}
          />

          {/* Action Buttons below profile section */}
          <div className="d-flex align-items-center justify-content-end gap-2 pt-1">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleResetProfile}
              disabled={isSaving || isLoading}
              className="d-inline-flex align-items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </Button>

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSaving || isLoading}
                className="d-inline-flex align-items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </Form>
      )}

      {/* Tab 2: System Configuration Parameters */}
      {activeTab === 'settings' && (
        <div className="d-flex flex-column gap-3">
          <SystemSettingsSection
            settings={settings}
            canEdit={canEdit}
            isDark={isDark}
            onSettingChange={handleSettingChange}
          />

          {/* Action Buttons below settings section */}
          <div className="d-flex align-items-center justify-content-end gap-2 pt-1">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleResetSettings}
              disabled={isSaving || isLoading}
              className="d-inline-flex align-items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </Button>

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                disabled={isSaving || isLoading}
                className="d-inline-flex align-items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SchoolProfileView;
