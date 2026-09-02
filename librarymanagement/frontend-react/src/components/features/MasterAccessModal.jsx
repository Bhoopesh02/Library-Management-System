import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, CheckCircle2, Crown, Lock, ArrowRight, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import styles from './MasterAccessModal.module.css';

/**
 * MasterAccessModal Component
 * Allows an existing Admin to elevate their session/account to Master Admin via Master Key
 */
export const MasterAccessModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isMaster = Boolean(user?.masterAdmin);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!masterKey.trim()) {
      setError('Please enter the Admin Master Key.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetchApi('/auth/elevate-master', {
        method: 'POST',
        body: JSON.stringify({ masterKey: masterKey.trim() })
      });

      if (res.data) {
        updateUser(res.data.user, res.data.accessToken, res.data.refreshToken);
        setIsSuccess(true);
        setMasterKey('');
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Invalid Master Key. Elevation denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setMasterKey('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Admin Profile & Master Access"
      size="md"
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      }
    >
      {/* Profile Overview Card */}
      <div className={styles.profileCard}>
        <div className={styles.avatarLarge}>
          {isMaster ? <Crown size={28} className={styles.crownIcon} /> : <User size={28} />}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.nameRow}>
            <h4>{user?.name || 'Administrator'}</h4>
            {isMaster ? (
              <span className={styles.masterBadge}>
                <Crown size={12} /> Master Admin
              </span>
            ) : (
              <Badge style={{ backgroundColor: 'rgba(114, 9, 183, 0.12)', color: '#7209b7' }}>
                <ShieldAlert size={12} /> Standard Admin
              </Badge>
            )}
          </div>
          <p className={styles.emailText}>{user?.email}</p>
        </div>
      </div>

      {isSuccess && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={20} />
          <div>
            <strong>Master Access Granted!</strong>
            <p>Your account has been elevated with full Master Admin privileges.</p>
          </div>
        </div>
      )}

      {/* Master Status or Elevation Form */}
      {isMaster ? (
        <div className={styles.masterActiveBox}>
          <div className={styles.activeHeader}>
            <ShieldCheck size={22} className={styles.activeShield} />
            <h5>Master Authority Active</h5>
          </div>
          <p className={styles.activeDesc}>
            This administrator account holds verified Master Authority. You have permissions to:
          </p>
          <ul className={styles.privilegeList}>
            <li>Delete Administrator accounts safely with system audit trail</li>
            <li>Delete Patron / Member accounts and purge expired sessions</li>
            <li>Perform full catalog and system maintenance</li>
          </ul>
        </div>
      ) : (
        <div className={styles.elevationBox}>
          <div className={styles.elevationHeader}>
            <Lock size={18} className={styles.lockIcon} />
            <h5>Elevate to Master Admin</h5>
          </div>
          <p className={styles.elevationDesc}>
            Enter the designated <strong>Admin Master Key</strong> to unlock master authority for your account. Master access is restricted and not granted to all admins by default.
          </p>

          <form onSubmit={handleUnlock}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <KeyRound size={15} /> Admin Master Key
              </label>
              <Input
                type="password"
                placeholder="Enter master key..."
                value={masterKey}
                onChange={(e) => {
                  setMasterKey(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
            </div>

            {error && (
              <div className={styles.errorAlert}>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              isLoading={isLoading}
            >
              <Crown size={16} /> Unlock Master Access <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default MasterAccessModal;
