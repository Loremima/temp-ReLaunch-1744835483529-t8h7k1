-- Créer une fonction pour insérer directement dans la table history
CREATE OR REPLACE FUNCTION insert_history(
  p_prospect_id UUID,
  p_template_id UUID,
  p_status TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO history (prospect_id, template_id, sent_at, status)
  VALUES (p_prospect_id, p_template_id, NOW(), p_status);
END;
$$ LANGUAGE plpgsql; 