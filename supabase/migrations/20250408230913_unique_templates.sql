/*
  # Empêcher les doublons d'emails
  
  1. Changements
    - Ajouter une contrainte unique sur prospect_id et template_id dans la table history
    - Nettoyer les éventuels doublons existants avant d'ajouter la contrainte
    - Optimiser la requête de vérification des templates déjà envoyés
    
  2. Sécurité
    - Maintenir les politiques RLS existantes
*/

-- D'abord, supprimer les doublons éventuels (garder seulement l'entrée la plus récente)
WITH duplicates AS (
  SELECT 
    id,
    prospect_id,
    template_id,
    ROW_NUMBER() OVER (
      PARTITION BY prospect_id, template_id
      ORDER BY sent_at DESC
    ) as rn
  FROM history
)
DELETE FROM history h
USING duplicates d
WHERE h.id = d.id
AND d.rn > 1;

-- Ajouter une contrainte unique pour empêcher les doublons
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'history_prospect_template_key'
  ) THEN
    ALTER TABLE history 
    ADD CONSTRAINT history_prospect_template_key 
    UNIQUE (prospect_id, template_id);
    
    RAISE NOTICE 'Contrainte unique ajoutée pour empêcher les doublons d''emails';
  END IF;
END $$;

-- Ajouter des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_history_template_prospect ON history(template_id, prospect_id);
CREATE INDEX IF NOT EXISTS idx_history_sent_at ON history(sent_at DESC);

-- Mettre à jour la fonction de progression des étapes
CREATE OR REPLACE FUNCTION update_prospect_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si le template a déjà été envoyé (doublon)
  IF EXISTS (
    SELECT 1 FROM history 
    WHERE prospect_id = NEW.prospect_id 
    AND template_id = NEW.template_id
    AND id != NEW.id
  ) THEN
    RAISE NOTICE 'Template % déjà envoyé au prospect %, email ignoré', NEW.template_id, NEW.prospect_id;
    RETURN NULL; -- Annuler l'insertion
  END IF;

  -- Update prospect stage and status
  UPDATE prospects
  SET 
    followup_stage = CASE 
      WHEN followup_stage IS NULL THEN 1
      WHEN followup_stage < 3 THEN followup_stage + 1
      ELSE followup_stage
    END
  WHERE id = NEW.prospect_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 