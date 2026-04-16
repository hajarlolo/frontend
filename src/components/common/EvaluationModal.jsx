import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStar } from 'react-icons/fa';
import Modal from './Modal';
import Button from './Button';
import TextArea from './TextArea';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import './EvaluationModal.css';

export default function EvaluationModal({ isOpen, onClose, targetId, targetType, targetName }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post('/evaluations', payload);
    },
    onSuccess: () => {
      toast.success('Évaluation soumise avec succès !');
      queryClient.invalidateQueries(['company-postulations']);
      queryClient.invalidateQueries(['applications']);
      queryClient.invalidateQueries(['company-student-profile']);
      onClose();
      // Reset
      setRating(0);
      setComment('');
    },
    onError: () => {
      toast.error('Erreur lors de la soumission de l\'évaluation.');
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.warning('Veuillez sélectionner une note.');
      return;
    }

    // The API expects both IDs in the payload
    // targetId should contain both id_entreprise and id_candidat
    const payload = {
      ...targetId, // Contains both id_entreprise and id_candidat
      note: rating,
      commentaire: comment,
    };

    mutation.mutate(payload);
  };
  
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Évaluer ${targetName}`}
      size="md"
    >
      <div className="evaluation-modal-content">
        <p className="evaluation-instruction text-slate-500 dark:text-slate-400">
          Votre avis est important. Notez votre expérience avec {targetName}.
        </p>

        <div className="star-rating-container">
          {[...Array(5)].map((star, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                />
                <FaStar
                  className="star"
                  color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  size={40}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
        </div>
        
        <div className="rating-label text-slate-800 dark:text-white">
          {rating > 0 ? `${rating} / 5` : 'Sélectionnez une note'}
        </div>

        <TextArea
          label="Votre commentaire"
          placeholder="Partagez votre expérience en quelques mots..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <div className="evaluation-actions">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button 
            variant="brand" 
            onClick={handleSubmit}
            loading={mutation.isPending}
          >
            Soumettre
          </Button>
        </div>
      </div>
    </Modal>
  );
}
