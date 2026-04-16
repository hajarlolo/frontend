import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FaFileUpload, FaRobot, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { api } from '../../services/api';

// Debug API configuration
console.log('=== CV Parser API Debug ===');
console.log('API Base URL:', api.defaults.baseURL);
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
console.log('Forced URL for CV parsing: http://localhost:8000/api/cv/parse');

export default function CvParser({ onParseSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  const parseMutation = useMutation({
    mutationFn: async (file) => {
      console.log('Starting CV parsing for file:', file.name);
      
      const formData = new FormData();
      formData.append('cv_file', file);
      
      try {
        console.log('=== Request Details ===');
        console.log('Base URL:', api.defaults.baseURL);
        console.log('Full URL:', api.defaults.baseURL + '/cv/parse');
        console.log('Sending request to API...');
        
        const response = await api.post('/cv/parse', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('API Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
          fullURL: error.config?.baseURL + error.config?.url
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('CV parsing successful:', data);
      setParsedData(data.data);
      if (onParseSuccess) {
        onParseSuccess(data.data);
      }
    },
    onError: (error) => {
      console.error('CV parsing failed:', error);
      
      let errorMessage = 'Erreur inconnue';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error for debugging
      console.log('Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      alert('Échec de l\'analyse du CV: ' + errorMessage);
    },
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Veuillez sélectionner un fichier PDF, DOC ou DOCX');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      parseMutation.mutate(selectedFile);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setParsedData(null);
    parseMutation.reset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!parsedData ? (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-violet to-brand-magenta rounded-full mb-4">
              <FaRobot className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyse automatique de CV</h3>
            <p className="text-slate-600 text-sm">
              Téléchargez votre CV et notre IA extraira automatiquement vos informations
            </p>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-brand-violet bg-brand-violet/5'
                : 'border-slate-300 hover:border-brand-violet/50 bg-slate-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={parseMutation.isPending}
            />

            <div className="pointer-events-none">
              <FaFileUpload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-700 font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Glissez votre CV ici ou cliquez pour sélectionner'}
              </p>
              <p className="text-slate-500 text-sm">
                Formats supportés: PDF, DOC, DOCX (max 5MB)
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpload}
                disabled={parseMutation.isPending}
                className="flex-1 bg-gradient-to-r from-brand-violet to-brand-magenta text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {parseMutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <FaRobot />
                    Analyser le CV
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={parseMutation.isPending}
                className="px-6 py-3 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          )}

          {parseMutation.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <FaTimes className="text-red-500 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Erreur lors de l'analyse</p>
                <p className="text-red-600 text-sm mt-1">
                  {parseMutation.error?.response?.data?.error || 'Veuillez réessayer'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">CV analysé avec succès!</h3>
            <p className="text-slate-600 text-sm">
              Vos informations ont été extraites. Vous pouvez maintenant les modifier si nécessaire.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-slate-800 mb-3">Informations extraites:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Nom:</span>
                <span className="font-medium">{parsedData.nom_complet || 'Non trouvé'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium">{parsedData.email || 'Non trouvé'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Téléphone:</span>
                <span className="font-medium">{parsedData.telephone || 'Non trouvé'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">École:</span>
                <span className="font-medium">{parsedData.ecole_actuelle || 'Non trouvé'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Compétences:</span>
                <span className="font-medium">
                  {parsedData.competences?.length > 0 
                    ? parsedData.competences.slice(0, 3).join(', ') + 
                      (parsedData.competences.length > 3 ? '...' : '')
                    : 'Non trouvé'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (onParseSuccess) {
                  onParseSuccess(parsedData);
                }
              }}
              className="flex-1 bg-gradient-to-r from-brand-violet to-brand-magenta text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            >
              Continuer vers le profil
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Réanalyser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
