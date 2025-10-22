import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, analyzeProfile } from '../../services/profileService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userId = user.id_usuario;
        
        // Obtener perfil del usuario
        const profileResponse = await getProfile(userId);
        if (profileResponse.success) {
          setProfile(profileResponse.profile || profileResponse.data);
          
          // Analizar perfil con IA
          const analysisResponse = await analyzeProfile(userId);
          if (analysisResponse.success) {
            setAnalysis(analysisResponse.analysis || analysisResponse.data);
          }
        }
      } catch (err) {
        console.error('Error al obtener datos de perfil:', err);
        setError('No se pudieron cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">No se encontró el perfil</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido, {user?.nombres} {user?.apellidos}</p>
      </header>

      <div className="dashboard-content">
        <div className="profile-card">
          <h2>Tu Perfil</h2>
          <div className="profile-details">
            <div className="profile-item">
              <span>Nombre:</span>
              <span>{profile.nombres} {profile.apellidos}</span>
            </div>
            <div className="profile-item">
              <span>Email:</span>
              <span>{profile.email}</span>
            </div>
            <div className="profile-item">
              <span>Edad:</span>
              <span>{profile.age || 'No especificada'}</span>
            </div>
            <div className="profile-item">
              <span>Ciudad:</span>
              <span>{profile.ciudad}, {profile.departamento}</span>
            </div>
            <div className="profile-item">
              <span>Ingresos Mensuales:</span>
              <span>${profile.income?.toLocaleString() || profile.ingresos_mensuales_cop?.toLocaleString()} COP</span>
            </div>
            <div className="profile-item">
              <span>Nivel de Riesgo:</span>
              <span>{profile.risk_tolerance || profile.nivel_conocimiento || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="analysis-card">
          <h2>Análisis de Perfil Financiero</h2>
          {analysis ? (
            <div className="analysis-content">
              <p>{analysis}</p>
            </div>
          ) : (
            <p>No hay análisis disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
