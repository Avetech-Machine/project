import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AiOutlineUser } from 'react-icons/ai';
import userService from '../../services/userService';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Cleanup effect to remove modal class when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    setForm({ email: '', password: '', firstName: '', lastName: '' });
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) return;
    try {
      setSubmitting(true);
      setError(null);
      // Combine firstName and lastName as username for API
      const userData = {
        ...form,
        username: `${form.firstName} ${form.lastName}`.trim()
      };
      const created = await userService.createUser(userData);
      setUsers(prev => [created, ...prev]);
      closeModal();
    } catch (err) {
      setError(err.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-management">
      <div className="header-row">
        <h1>Kullanıcı İşlemleri</h1>
        <div className="header-buttons">
          <button className="secondary-btn" onClick={openProfileModal}>
            <AiOutlineUser className="btn-icon" />
            Profilim
          </button>
          <button className="primary-btn" onClick={openModal}>
            <span className="btn-icon">+</span>
            Yeni Kullanıcı Ekle
          </button>
        </div>
      </div>

      {loading && <div className="info">Yükleniyor...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Soyad</th>
                <th>E-posta</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.firstName}</td>
                  <td>{u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="info">Gösterilecek kullanıcı bulunamadı.</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yeni Kullanıcı Ekle</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Ad Soyad *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ad" />
              </div>
              <div className="form-row">
                <label></label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Soyad" />
              </div>
              <div className="form-row">
                <label>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Şifre *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} />
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={closeModal}>İptal</button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  <span className="btn-icon">+</span>
                  {submitting ? 'Kullanıcı Ekleniyor...' : 'Kullanıcı Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <div className="modal-backdrop" onClick={closeProfileModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profil Bilgilerim</h2>
              <button className="close-btn" onClick={closeProfileModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-info">
                <div className="profile-field">
                  <label>Kullanıcı Adı:</label>
                  <span>{user?.username || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <label>E-posta:</label>
                  <span>{user?.email || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <label>Rol:</label>
                  <span>{user?.role || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <label>Kayıt Tarihi:</label>
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'N/A'}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="primary-btn" onClick={closeProfileModal}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;


