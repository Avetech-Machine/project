import React, { useEffect, useState } from 'react';
import projectService from '../../services/projectService';
import './AllServicesTable.css';

const ErrorReceipts = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeleted = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getDeletedProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Deleted projects fetch error:', err);
        setError(err.message || 'Silinmiş projeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchDeleted();
  }, []);

  return (
    <div className="all-services">
      <div className="services-header">
        <h1>Hatalı Proje Formları</h1>
        <p>Silinmiş projeler burada listelenir.</p>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Projeler yükleniyor...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Hata: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="services-table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Proje Kodu</th>
                <th>Makine Adı</th>
                <th>Yıl</th>
                <th>Oluşturulma</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="service-row">
                  <td>{project.projectCode || '-'}</td>
                  <td>{project.title || '-'}</td>
                  <td>{project.year || '-'}</td>
                  <td>{project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : '-'}</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ErrorReceipts;


